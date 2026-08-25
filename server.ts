import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getDatabase,
  getDatabaseAsync,
  saveDatabaseAsync,
  clearDatabaseAsync,
  resetDatabaseToDemo,
  generateHandwrittenPaperSvg,
} from './server/db';
import { getSupabaseClient } from './server/supabaseDb';

import { analyzeHandwrittenMath, generateTargetedPracticeAI, analyzeSyllabusDocument } from './server/gemini';
import { validateEquationStep, solveAndValidateMathSubmission } from './server/mathValidator';
import fs from 'fs';
import xlsx from 'xlsx';

let dataset1Cache: any[] | null = null;
function getDataset1Rows() {
  if (dataset1Cache) return dataset1Cache;
  const filePath = path.join(process.cwd(), 'dataset1', 'Maths_eqations_handwritten.xlsx');
  if (fs.existsSync(filePath)) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    dataset1Cache = xlsx.utils.sheet_to_json(sheet);
    return dataset1Cache;
  }
  return [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'GradeMate AI Engine' });
  });

  // DB State (Teacher-Scoped Data Isolation)
  app.get('/api/db/state', async (req, res) => {
    try {
      const reqTeacherId = (req.query.teacherId || req.headers['x-teacher-id']) as string | undefined;
      const reqRole = (req.query.role || req.headers['x-user-role']) as string | undefined;
      const reqStudentId = (req.query.studentId || req.headers['x-student-id']) as string | undefined;

      const db = await getDatabaseAsync();
      if (!db.teacherStudents) db.teacherStudents = [];

      if (reqRole === 'TEACHER' && reqTeacherId) {
        let teacherRels = db.teacherStudents.filter((ts) => ts.teacherId === reqTeacherId);
        // Only populate initial demo students for explicit demo teacher account if no relationships exist
        if (teacherRels.length === 0 && reqTeacherId === 'usr_teacher_demo') {
          const initialStudents = db.students || [];
          if (initialStudents.length > 0) {
            initialStudents.forEach((s) => {
              if (!db.teacherStudents.some((ts) => ts.teacherId === reqTeacherId && ts.studentId === s.id)) {
                db.teacherStudents.push({
                  id: `ts_${reqTeacherId}_${s.id}`,
                  teacherId: reqTeacherId,
                  studentId: s.id,
                  createdAt: new Date().toISOString(),
                });
              }
            });
            teacherRels = db.teacherStudents.filter((ts) => ts.teacherId === reqTeacherId);
          }
        }

        const assignedStudentIds = teacherRels.map((ts) => ts.studentId);

        const scopedStudents = (db.students || []).filter((s) => assignedStudentIds.includes(s.id));
        const scopedAssignments = (db.assignments || []).filter(
          (a: any) => a.teacherId === reqTeacherId || a.teacher_id === reqTeacherId
        );
        const scopedSubmissions = (db.submissions || []).filter(
          (sub: any) => assignedStudentIds.includes(sub.student_id) || sub.teacher_id === reqTeacherId
        );

        const scopedGroups = (db.groups || [])
          .map((g: any) => ({
            ...g,
            students: (g.students || []).filter((st: any) => assignedStudentIds.includes(st.id)),
          }))
          .filter((g: any) => g.students.length > 0);

        const scopedNextBestActions = (db.nextBestActions || []).filter(
          (nba: any) => !nba.student_id || assignedStudentIds.includes(nba.student_id)
        );
        const scopedInterventions = (db.interventions || []).filter((inv: any) => assignedStudentIds.includes(inv.student_id));
        const scopedPracticeSets = (db.practiceSets || []).filter((ps: any) => assignedStudentIds.includes(ps.student_id));

        const totalStudents = scopedStudents.length;
        const totalAssignments = scopedAssignments.length;
        const avgScore =
          scopedSubmissions.length > 0
            ? Math.round(
                scopedSubmissions.reduce((acc: number, s: any) => acc + (s.score / s.max_score) * 100, 0) /
                  scopedSubmissions.length
              )
            : 0;
        const supportNeeded = scopedStudents.filter((s: any) => (s.overall_mastery || s.overallAccuracy || 100) < 60).length;

        const scopedClassStats = {
          totalStudents,
          totalAssignments,
          averageClassScore: avgScore,
          commonLearningGap: scopedStudents.length > 0 ? (scopedStudents[0].common_error || 'None recorded') : 'None recorded yet',
          studentsNeedingSupport: supportNeeded,
          interventionSuccessRate: db.classStats?.interventionSuccessRate || 0,
        };

        return res.json({
          ...db,
          students: scopedStudents,
          assignments: scopedAssignments,
          submissions: scopedSubmissions,
          groups: scopedGroups,
          nextBestActions: scopedNextBestActions,
          interventions: scopedInterventions,
          practiceSets: scopedPracticeSets,
          classStats: scopedClassStats,
        });
      } else if (reqRole === 'STUDENT' && reqStudentId) {
        const scopedStudents = (db.students || []).filter((s) => s.id === reqStudentId);
        const scopedSubmissions = (db.submissions || []).filter((sub: any) => sub.student_id === reqStudentId);
        const scopedPracticeSets = (db.practiceSets || []).filter((ps: any) => ps.student_id === reqStudentId);
        return res.json({
          ...db,
          students: scopedStudents,
          submissions: scopedSubmissions,
          practiceSets: scopedPracticeSets,
        });
      }

      res.json(db);
    } catch (err: any) {
      console.error('Error fetching db state:', err);
      res.status(500).json({ error: 'Failed to fetch database state' });
    }
  });

  // GET Teacher Evaluation Settings
  app.get('/api/teacher/settings', (req, res) => {
    const db = getDatabase();
    res.json({
      settings: db.evaluationSettings || {
        feedbackMode: 'Socratic',
        partialCreditStrictness: 'Balanced',
        autoFlagReview: true,
      },
    });
  });

  // POST Update Teacher Evaluation Settings & save to DBMS
  app.post('/api/teacher/settings', async (req, res) => {
    try {
      const { feedbackMode, partialCreditStrictness, autoFlagReview } = req.body;
      const db = await getDatabaseAsync();
      
      db.evaluationSettings = {
        feedbackMode: feedbackMode || 'Socratic',
        partialCreditStrictness: partialCreditStrictness || 'Balanced',
        autoFlagReview: autoFlagReview ?? true,
      };

      await saveDatabaseAsync(db);

      res.json({
        success: true,
        message: 'Teacher evaluation preferences saved to DBMS',
        settings: db.evaluationSettings,
      });
    } catch (err: any) {
      console.error('Error saving teacher settings:', err);
      res.status(500).json({ error: 'Failed to save evaluation settings to DBMS' });
    }
  });

  // Dataset1 items API
  app.get('/api/dataset1', (req, res) => {
    const rows = getDataset1Rows();
    const items = rows.map((row: any, index: number) => {
      const imgNum = index + 1;
      const filename = `${imgNum}.png`;
      const imgPath = path.join(process.cwd(), 'dataset1', 'Handwritten_equations_images', filename);
      const hasImage = fs.existsSync(imgPath);
      return {
        id: `ds1_${imgNum}`,
        index: imgNum,
        expression: row.Expression ? String(row.Expression).trim() : '',
        answer: row.Answer !== undefined ? String(row.Answer) : '',
        imageFilename: hasImage ? filename : null,
        imageUrl: hasImage ? `/api/dataset1/image/${filename}` : null,
      };
    });
    res.json({ total: items.length, items });
  });

  // Dataset1 image server
  app.get('/api/dataset1/image/:filename', (req, res) => {
    const filename = req.params.filename;
    const imgPath = path.join(process.cwd(), 'dataset1', 'Handwritten_equations_images', filename);
    if (fs.existsSync(imgPath)) {
      res.sendFile(imgPath);
    } else {
      res.status(404).send('Image not found');
    }
  });

  // Reset / Clear Database to empty Supabase state
  app.post('/api/db/reset', async (req, res) => {
    const db = await clearDatabaseAsync();
    res.json({ success: true, message: 'Cleared database and saved clean state to Supabase', db });
  });

  app.post('/api/db/clear', async (req, res) => {
    const db = await clearDatabaseAsync();
    res.json({ success: true, message: 'Successfully cleared all demo data in Supabase', db });
  });

  // AUTHENTICATION API ROUTES

  // Register New User in Supabase Database Table ("User")
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, role = 'TEACHER', studentId } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const cleanStdId = studentId ? studentId.trim() : undefined;
      const supabase = getSupabaseClient();

      // 1. Check if user already exists in Supabase "User" table
      const { data: existingUser } = await supabase
        .from('User')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists in the database.' });
      }

      const userId = `usr_${Date.now()}`;
      const newUserRow = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        passwordHash: password,
        role: role as 'TEACHER' | 'STUDENT',
        studentId: cleanStdId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Insert row directly into Supabase PostgreSQL "User" table
      const { data: insertedUser, error: insertError } = await supabase
        .from('User')
        .insert(newUserRow)
        .select()
        .single();

      if (insertError) {
        console.error('[Supabase DB Error] Insert into "User" table failed:', insertError);
      } else {
        console.log('[Supabase DB Success] Saved new row to "User" table:', insertedUser.email);
      }

      // Also register in Supabase Auth (auth.users)
      await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: { data: { name: cleanName, role, studentId: cleanStdId } },
      }).catch(() => { });

      // 3. Update memory DB state & save database JSON
      const db = await getDatabaseAsync();
      if (!db.users) db.users = [];
      const existingIdx = db.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      if (existingIdx >= 0) {
        db.users[existingIdx] = newUserRow as any;
      } else {
        db.users.push(newUserRow as any);
      }

      if (role === 'STUDENT') {
        const stdId = cleanStdId || `std_${userId}`;
        if (!db.students.some((s) => s.id === stdId)) {
          db.students.push({
            id: stdId,
            name: cleanName,
            email: cleanEmail,
            class: 'Grade 10',
            overallAccuracy: 100,
            totalEvaluations: 0,
            weakTopics: [],
            strongTopics: [],
            learningPace: 'New Student',
            digitalTwinSummary: `${cleanName} joined GradeMate AI as a student.`,
          } as any);
        }
      }

      await saveDatabaseAsync(db);

      res.json({
        success: true,
        user: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          role: role,
          studentId: cleanStdId,
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Failed to register user in database.' });
    }
  });

  // Add New Student Endpoint (Teacher Action)
  app.post('/api/students/add', async (req, res) => {
    try {
      const { name, email, grade = 'Grade 10', section = 'A', studentId, teacherId, teacher_id } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Student name and email are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      const db = await getDatabaseAsync();
      if (!db.users) db.users = [];
      if (!db.students) db.students = [];
      if (!db.teacherStudents) db.teacherStudents = [];

      const currentTeacherId =
        teacherId ||
        teacher_id ||
        (req.headers['x-teacher-id'] as string) ||
        (db.users.find((u) => u.role === 'TEACHER')?.id) ||
        'usr_teacher_demo';

      const supabase = getSupabaseClient();

      // Check if student user already exists
      let existingUser = db.users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
      let stdId = existingUser?.studentId || studentId?.trim();

      if (!existingUser) {
        // Query Supabase User table to be sure
        const { data: dbUserRow } = await supabase.from('User').select('*').eq('email', cleanEmail).maybeSingle();
        if (dbUserRow) {
          existingUser = dbUserRow;
          stdId = dbUserRow.studentId || dbUserRow.id;
          if (!db.users.some(u => u.id === dbUserRow.id)) {
            db.users.push(dbUserRow);
          }
        }
      }

      if (!stdId) {
        stdId = `std_${Date.now()}`;
      }

      let userId = existingUser ? existingUser.id : `usr_${Date.now()}`;

      if (!existingUser) {
        const newUserRow = {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          passwordHash: 'student123',
          role: 'STUDENT' as const,
          studentId: stdId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase.from('User').insert(newUserRow);
        if (insertErr) {
          console.warn('[Supabase DB] Warning inserting student row into User table:', insertErr.message);
        }

        await supabase.auth.signUp({
          email: cleanEmail,
          password: 'student123',
          options: { data: { name: cleanName, role: 'STUDENT', studentId: stdId } },
        }).catch(() => {});

        db.users.push(newUserRow);
      }

      let studentProfile = db.students.find(
        (s: any) => s.id === stdId || (s.email && s.email.toLowerCase() === cleanEmail)
      );

      if (!studentProfile) {
        studentProfile = {
          id: stdId,
          name: cleanName,
          email: cleanEmail,
          class: `${grade} ${section}`,
          grade_level: grade,
          overall_mastery: 0,
          overallAccuracy: 0,
          totalEvaluations: 0,
          error_frequency: 0,
          common_error: 'None recorded yet',
          error_dna: [],
          weakTopics: [],
          strongTopics: [],
          strengths: ['Enrolled in class'],
          needs_improvement: [],
          topic_mastery: [],
          assignment_history: [],
          learning_velocity: 'New Student',
          digitalTwinSummary: `${cleanName} joined ${grade} Section ${section}.`,
        } as any;
        db.students.push(studentProfile);
      } else {
        (studentProfile as any).name = cleanName;
        (studentProfile as any).email = cleanEmail;
        (studentProfile as any).class = `${grade} ${section}`;
        (studentProfile as any).grade_level = grade;
      }

      const finalStudentId = studentProfile.id;

      // Link Teacher -> Student relationship for currentTeacherId
      if (currentTeacherId) {
        const relExists = db.teacherStudents.some(
          (ts) => ts.teacherId === currentTeacherId && ts.studentId === finalStudentId
        );
        if (!relExists) {
          const relId = `ts_${currentTeacherId}_${finalStudentId}`;
          db.teacherStudents.push({
            id: relId,
            teacherId: currentTeacherId,
            studentId: finalStudentId,
            createdAt: new Date().toISOString(),
          });

          // Sync to Supabase PostgreSQL relationship tables
          try {
            await supabase.from('TeacherStudent').upsert({
              id: relId,
              teacherId: currentTeacherId,
              studentId: finalStudentId,
            });
            await supabase.from('teacher_students').upsert({
              id: relId,
              teacher_id: currentTeacherId,
              student_id: finalStudentId,
            });
          } catch (e) {}
        }
      }

      db.classStats.totalStudents = db.students.length;
      await saveDatabaseAsync(db);

      console.log(`[Supabase DB Success] Added/linked student: ${cleanName} (${cleanEmail}) for teacher ${currentTeacherId}`);
      res.json({ success: true, student: studentProfile });
    } catch (err: any) {
      console.error('Error adding student:', err);
      res.status(500).json({ error: err.message || 'Failed to add student to database.' });
    }
  });

  // Login User via Supabase Database Table ("User")
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role, studentId } = req.body;

      if (!email && !studentId) {
        return res.status(400).json({ error: 'Email or Student ID is required to sign in.' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Password is required to sign in.' });
      }

      const queryEmail = email ? email.trim().toLowerCase() : '';
      const queryStdId = studentId ? studentId.trim() : '';
      const supabase = getSupabaseClient();

      // 1. Query Supabase PostgreSQL "User" database table
      let dbUser: any = null;

      if (queryEmail) {
        const { data } = await supabase
          .from('User')
          .select('*')
          .eq('email', queryEmail)
          .maybeSingle();
        dbUser = data;
      } else if (queryStdId) {
        const { data } = await supabase
          .from('User')
          .select('*')
          .eq('studentId', queryStdId)
          .maybeSingle();
        dbUser = data;
      }

      // 2. Fallback check memory DB if table sync was pending
      if (!dbUser) {
        const db = await getDatabaseAsync();
        if (db.users) {
          dbUser = db.users.find(
            (u) =>
              (queryEmail && u.email.toLowerCase() === queryEmail) ||
              (queryStdId && u.studentId === queryStdId)
          );
        }
      }

      // 3. Strict Check: If user does not exist in database, DENY LOGIN
      if (!dbUser) {
        return res.status(401).json({
          error: 'No account found in database for this email/student ID. Please click "Create Account" to register.',
        });
      }

      // 4. Validate Password
      if (dbUser.passwordHash && dbUser.passwordHash !== password) {
        return res.status(401).json({ error: 'Incorrect password. Please check your credentials.' });
      }

      res.json({
        success: true,
        user: {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          studentId: dbUser.studentId,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Failed to authenticate user.' });
    }
  });


  // GET Curricula list
  app.get('/api/curricula', async (req, res) => {
    const db = await getDatabaseAsync();
    res.json({ curricula: db.curricula || [] });
  });

  // GET Syllabus details by ID
  app.get('/api/curricula/:id', (req, res) => {
    const db = getDatabase();
    const id = req.params.id;
    const curriculum = (db.curricula || []).find((c: any) => c.id === id);
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }
    const topics = (db.curriculumTopics || []).filter((t: any) => t.curriculumId === id);
    const chunks = (db.curriculumChunks || []).filter((c: any) => c.curriculumId === id);
    res.json({ curriculum, topics, chunks });
  });

  // POST Upload & Analyze Syllabus
  app.post('/api/curricula/upload', async (req, res) => {
    try {
      const {
        name,
        board,
        class_year,
        subject,
        academic_year,
        file_name = 'Syllabus.pdf',
        file_base64,
        raw_text,
        teacher_id = 'usr_teacher_demo',
      } = req.body;

      if (!name || !board || !subject) {
        return res.status(400).json({ error: 'Name, board, and subject are required.' });
      }

      const db = getDatabase();
      const curriculumId = `curr_${Date.now()}`;

      // Create initial syllabus record
      const newCurriculum: any = {
        id: curriculumId,
        teacherId: teacher_id,
        name,
        board,
        class: class_year || '10',
        subject,
        academicYear: academic_year || '2026',
        fileName: file_name,
        status: 'Reading',
        unitsCount: 0,
        topicsCount: 0,
        conceptsCount: 0,
        createdAt: new Date().toISOString(),
        rawText: raw_text || `${name} ${board} ${subject} Syllabus`,
      };

      db.curricula.unshift(newCurriculum);

      // Perform AI Syllabus Analysis
      const analysis = await analyzeSyllabusDocument({
        name,
        board,
        class_year,
        subject,
        academic_year,
        file_name,
        file_base64,
        raw_text,
      });

      // Populate Topics in DB
      const createdTopics = (analysis.topics || []).map((t: any, idx: number) => ({
        id: `ct_${curriculumId}_${idx + 1}`,
        curriculumId,
        unit: t.unit || 'General Unit',
        topic: t.topic || 'General Topic',
        subtopic: t.subtopic || '',
        concept: t.concept || 'Core Concepts',
        learningObjective: t.learningObjective || 'Master topic principles.',
        importantFormulas: t.importantFormulas || [],
        expectedMethods: t.expectedMethods || [],
        expectedKnowledgeLevel: t.expectedKnowledgeLevel || 'Standard Knowledge Level',
      }));

      // Populate Chunks in DB for Isolated RAG Retrieval
      const createdChunks = (analysis.chunks || []).map((c: any, idx: number) => ({
        id: `chk_${curriculumId}_${idx + 1}`,
        curriculumId,
        teacherId: teacher_id,
        unit: c.unit || 'General Unit',
        topic: c.topic || 'General Topic',
        content: c.content || `Unit: ${c.unit} Topic: ${c.topic}`,
      }));

      db.curriculumTopics.push(...createdTopics);
      db.curriculumChunks.push(...createdChunks);

      // Update curriculum status
      newCurriculum.status = 'Analysed';
      newCurriculum.unitsCount = analysis.summary.unitsCount;
      newCurriculum.topicsCount = analysis.summary.topicsCount;
      newCurriculum.conceptsCount = analysis.summary.conceptsCount;

      await saveDatabaseAsync(db);

      // Also sync to Supabase PostgreSQL database tables if available
      try {
        const supabase = getSupabaseClient();

        // 1. Ensure teacher_id exists in User table so Foreign Key constraint does not fail
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('id', teacher_id)
          .maybeSingle();

        if (!existingUser) {
          try {
            await supabase.from('User').insert({
              id: teacher_id,
              name: 'Teacher Account',
              email: `${teacher_id}@grademate.edu`,
              passwordHash: 'teacher123',
              role: 'TEACHER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {}
        }

        // 2. Upload raw syllabus file to Supabase Storage bucket
        let uploadedFileUrl = '';
        if (file_base64 || raw_text) {
          const fileContent = file_base64
            ? Buffer.from(file_base64, 'base64')
            : Buffer.from(raw_text || `${name} ${board} ${subject} Syllabus`);
          const storagePath = `syllabi/${curriculumId}_${file_name}`;
          
          await supabase.storage.from('grademate_data').upload(storagePath, fileContent, {
            contentType: file_base64 ? 'application/octet-stream' : 'text/plain',
            upsert: true,
          }).catch(() => {});

          const { data: publicUrlData } = supabase.storage.from('grademate_data').getPublicUrl(storagePath);
          if (publicUrlData) {
            uploadedFileUrl = publicUrlData.publicUrl;
          }
        }

        newCurriculum.fileUrl = uploadedFileUrl || `syllabi/${curriculumId}_${file_name}`;

        // 3. Upsert Curriculum into Supabase PostgreSQL Table
        const { error: currErr } = await supabase.from('Curriculum').upsert({
          id: curriculumId,
          teacherId: teacher_id,
          name,
          board,
          class: class_year || '10',
          subject,
          academicYear: academic_year || '2026',
          fileUrl: uploadedFileUrl || `syllabi/${curriculumId}_${file_name}`,
          fileName: file_name,
          status: 'Analysed',
          unitsCount: analysis.summary.unitsCount || 0,
          topicsCount: analysis.summary.topicsCount || 0,
          conceptsCount: analysis.summary.conceptsCount || 0,
          rawText: raw_text || `${name} ${board} ${subject} Syllabus`,
        });

        if (currErr) {
          console.error('[Supabase DB Error] Curriculum table insert failed:', currErr);
        } else {
          console.log(`[Supabase DB Success] Saved syllabus "${name}" (${curriculumId}) to Supabase Curriculum table!`);
        }

        if (createdTopics.length > 0) {
          const { error: topErr } = await supabase.from('CurriculumTopic').upsert(createdTopics);
          if (topErr) console.error('[Supabase DB Error] CurriculumTopic insert failed:', topErr);
          else console.log(`[Supabase DB Success] Saved ${createdTopics.length} topics to CurriculumTopic table!`);
        }

        if (createdChunks.length > 0) {
          const { error: chkErr } = await supabase.from('CurriculumChunk').upsert(createdChunks);
          if (chkErr) console.error('[Supabase DB Error] CurriculumChunk insert failed:', chkErr);
          else console.log(`[Supabase DB Success] Saved ${createdChunks.length} chunks to CurriculumChunk table!`);
        }
      } catch (sqlErr: any) {
        console.warn('[Supabase DB Sync Note]:', sqlErr?.message || sqlErr);
      }

      res.json({
        success: true,
        curriculum: newCurriculum,
        topics: createdTopics,
        summary: analysis.summary,
      });
    } catch (err: any) {
      console.error('Syllabus upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to process syllabus' });
    }
  });

  // PUT Update Extracted Topic Detail
  app.put('/api/curricula/:id/topic/:topicId', async (req, res) => {
    try {
      const db = await getDatabaseAsync();
      const { id, topicId } = req.params;
      const { unit, topic, concept, learningObjective } = req.body;

      const topicItem = (db.curriculumTopics || []).find((t: any) => t.id === topicId && t.curriculumId === id);
      if (!topicItem) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      if (unit) topicItem.unit = unit;
      if (topic) topicItem.topic = topic;
      if (concept) topicItem.concept = concept;
      if (learningObjective) topicItem.learningObjective = learningObjective;

      await saveDatabaseAsync(db);

      res.json({ success: true, topic: topicItem });
    } catch (err: any) {
      console.error('Error updating topic:', err);
      res.status(500).json({ error: 'Failed to update topic' });
    }
  });

  // DELETE Curriculum
  app.delete('/api/curricula/:id', async (req, res) => {
    try {
      const db = await getDatabaseAsync();
      const id = req.params.id;

      // Filter out curriculum, curriculumTopics, and curriculumChunks
      db.curricula = (db.curricula || []).filter((c: any) => c.id !== id);
      db.curriculumTopics = (db.curriculumTopics || []).filter((t: any) => t.curriculumId !== id);
      db.curriculumChunks = (db.curriculumChunks || []).filter((c: any) => c.curriculumId !== id);

      // Save updated database state to Supabase Cloud
      await saveDatabaseAsync(db);

      // Also delete from Supabase PostgreSQL tables if present
      try {
        const supabase = getSupabaseClient();
        await supabase.from('CurriculumChunk').delete().eq('curriculumId', id);
        await supabase.from('CurriculumTopic').delete().eq('curriculumId', id);
        await supabase.from('Curriculum').delete().eq('id', id);
        console.log(`[Supabase DB Success] Deleted curriculum ${id} and related knowledge base from Supabase tables!`);
      } catch (sqlErr: any) {
        console.warn('[Supabase DB Delete Warning]:', sqlErr?.message || sqlErr);
      }

      res.json({ success: true, message: 'Curriculum deleted successfully from database' });
    } catch (err: any) {
      console.error('Error deleting curriculum:', err);
      res.status(500).json({ error: 'Failed to delete curriculum from database' });
    }
  });

  // POST Create Assessment linked to Curriculum
  app.post('/api/assessments/create', async (req, res) => {
    try {
      const {
        title,
        subject,
        topic,
        curriculum_id,
        max_marks = 10,
        due_date = '2026-08-30',
        teacher_id = 'usr_teacher_demo',
        assigned_student_id = 'ALL',
      } = req.body;

      if (!title || !curriculum_id) {
        return res.status(400).json({ error: 'Assessment title and mandatory curriculum_id are required.' });
      }

      const db = await getDatabaseAsync();
      const assessmentId = `as_${Date.now()}`;
      const newAssignment = {
        id: assessmentId,
        teacherId: teacher_id,
        curriculumId: curriculum_id,
        assignedStudentId: assigned_student_id,
        title,
        subject: subject || 'Mathematics',
        topic: topic || 'Linear Equations',
        total_submissions: 0,
        average_score: 0,
        max_marks,
        due_date,
        questions: [
          {
            id: `q_${Date.now()}_1`,
            question_text: 'Solve for x: 2x + 5 = 15',
            max_marks: max_marks,
            rubric_guidelines: 'Isolate 2x = 10 and divide by 2.',
          },
        ],
      };

      db.assignments.unshift(newAssignment);
      await saveDatabaseAsync(db);

      // Save to Supabase PostgreSQL Assessment Table
      try {
        const supabase = getSupabaseClient();
        
        // Ensure teacherId exists in User table
        const { data: existingUser } = await supabase.from('User').select('id').eq('id', teacher_id).maybeSingle();
        if (!existingUser) {
          try {
            await supabase.from('User').insert({
              id: teacher_id,
              name: 'Teacher Account',
              email: `${teacher_id}@grademate.edu`,
              passwordHash: 'teacher123',
              role: 'TEACHER',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {}
        }

        const { error: asgnErr } = await supabase.from('Assessment').upsert({
          id: assessmentId,
          teacherId: teacher_id,
          curriculumId: curriculum_id,
          title,
          subject: subject || 'Mathematics',
          totalMarks: max_marks,
          dueDate: new Date(due_date).toISOString(),
          createdAt: new Date().toISOString(),
        });

        if (asgnErr) {
          console.error('[Supabase DB Error] Assessment insert failed:', asgnErr);
        } else {
          console.log(`[Supabase DB Success] Saved assessment "${title}" to Assessment table!`);
        }
      } catch (sqlErr: any) {
        console.warn('[Supabase DB Sync Note]:', sqlErr?.message || sqlErr);
      }

      res.json({ success: true, assignment: newAssignment });
    } catch (err: any) {
      console.error('Error creating assessment:', err);
      res.status(500).json({ error: 'Failed to create assessment in database' });
    }
  });

  // DELETE Assessment / Assignment
  app.delete('/api/assessments/:id', async (req, res) => {
    try {
      const db = await getDatabaseAsync();
      const id = req.params.id;

      // Filter out assessment from db.assignments
      db.assignments = (db.assignments || []).filter((a: any) => a.id !== id);

      // Save updated database state to Supabase Cloud
      await saveDatabaseAsync(db);

      // Also delete from Supabase PostgreSQL Assessment table if present
      try {
        const supabase = getSupabaseClient();
        await supabase.from('Assessment').delete().eq('id', id);
        console.log(`[Supabase DB Success] Deleted assessment ${id} from Supabase table!`);
      } catch (sqlErr: any) {
        console.warn('[Supabase DB Delete Warning]:', sqlErr?.message || sqlErr);
      }

      res.json({ success: true, message: 'Assessment deleted successfully from database' });
    } catch (err: any) {
      console.error('Error deleting assessment:', err);
      res.status(500).json({ error: 'Failed to delete assessment from database' });
    }
  });

  app.delete('/api/assignments/:id', async (req, res) => {
    try {
      const db = await getDatabaseAsync();
      const id = req.params.id;
      db.assignments = (db.assignments || []).filter((a: any) => a.id !== id);
      await saveDatabaseAsync(db);
      try {
        const supabase = getSupabaseClient();
        await supabase.from('Assessment').delete().eq('id', id);
      } catch (sqlErr: any) {}
      res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  });

  // Analyze Handwritten Answer
  app.post('/api/analyze-handwriting', async (req, res) => {
    try {
      const {
        image_base64,
        question,
        topic = 'Linear Equations',
        subject = 'Mathematics',
        max_marks = 10,
        student_id = 'std_1',
        student_name = 'Rahul Kumar',
        feedback_mode = 'Encouraging',
        curriculum_id = 'curr_cbse_10_math',
        teacher_id = 'usr_teacher_demo',
      } = req.body;

      const db = getDatabase();

      // Perform AI multimodal + step analysis with syllabus RAG context
      const aiResult = await analyzeHandwrittenMath({
        image_base64,
        question,
        topic,
        subject,
        max_marks,
        student_name,
        feedback_mode,
        curriculum_id,
        teacher_id,
      });

      // Perform deterministic symbolic & root-finding math verification on student steps
      const mathSolved = solveAndValidateMathSubmission({
        question,
        topic,
        max_marks,
        student_name,
        feedback_mode,
        image_base64,
        raw_steps: aiResult.student_steps?.map((s) => s.expression),
        curriculum_id,
      });

      // Merge verified steps, marks, and explanations
      const validatedSteps = (aiResult.student_steps || mathSolved.student_steps || []).map((step: any, idx: number) => {
        const mathStep = mathSolved.student_steps?.[idx];
        const mathVal = validateEquationStep(step.expression);
        const isCorrect = mathStep ? mathStep.correct : (step.correct ?? mathVal.isValid);
        return {
          ...step,
          correct: isCorrect,
          marks_awarded: mathStep ? mathStep.marks_awarded : (isCorrect ? step.max_marks || 3 : 0),
          explanation: mathStep?.explanation || step.explanation,
          math_validation: mathVal,
        };
      });

      const calculatedScore = validatedSteps.reduce((acc: number, s: any) => acc + (s.marks_awarded || 0), 0);
      const isFinalCorrect = validatedSteps.length > 0 ? validatedSteps[validatedSteps.length - 1].correct : false;

      // Create new submission record
      const submissionId = `sub_${Date.now()}`;
      const imageUrl =
        image_base64 && image_base64.length > 50
          ? image_base64
          : generateHandwrittenPaperSvg(
            student_name,
            question,
            validatedSteps.map((s) => ({ line: s.expression, isCorrect: s.correct }))
          );

      const newSubmission: any = {
        id: submissionId,
        student_id,
        student_name,
        assignment_id: 'asg_1',
        assignment_title: 'Handwritten Math Evaluation',
        topic,
        question,
        image_url: imageUrl,
        student_steps: validatedSteps,
        thinking_traces: aiResult.thinking_traces || mathSolved.thinking_traces || [
          {
            attempt_number: 1,
            visible_work: validatedSteps.map((s: any) => s.expression).join(' -> '),
            is_crossed_out: false,
            status: 'Final Answer',
            note: 'Visible handwritten submission steps analyzed.',
          },
        ],
        final_answer: aiResult.final_answer || mathSolved.final_answer || 'See steps',
        final_answer_correct: isFinalCorrect,
        score: Math.min(max_marks, Math.round(calculatedScore)),
        max_score: max_marks,
        rubric: aiResult.rubric || mathSolved.rubric || [
          { criterion: 'Step Setup', max_marks: Math.ceil(max_marks * 0.3), awarded_marks: Math.ceil(max_marks * 0.3), reason: 'Valid setup' },
          { criterion: 'Algebraic Reasoning', max_marks: Math.ceil(max_marks * 0.4), awarded_marks: Math.ceil(max_marks * 0.4), reason: 'Correct isolation' },
          { criterion: 'Final Calculation', max_marks: Math.floor(max_marks * 0.3), awarded_marks: 0, reason: 'Calculation error' },
        ],
        errors: aiResult.errors?.length ? aiResult.errors : mathSolved.errors,
        learning_gap: aiResult.learning_gap || mathSolved.learning_gap,
        feedback: aiResult.feedback || mathSolved.feedback,
        socratic_hint: aiResult.socratic_hint || mathSolved.socratic_hint,
        ai_confidence: aiResult.ai_confidence || 0.95,
        teacher_review_required: !isFinalCorrect,
        created_at: new Date().toISOString(),
      };

      // Add to database submissions
      db.submissions.unshift(newSubmission);

      // Update student profile history & recalculate mastery
      const student = db.students.find((s) => s.id === student_id);
      if (student) {
        student.assignment_history.unshift({
          assignment_id: `asg_${Date.now()}`,
          assignment_title: `Evaluation: ${topic}`,
          score: newSubmission.score,
          max_score: newSubmission.max_score,
          date: new Date().toISOString().split('T')[0],
        });

        // Recalculate student mastery & error dna
        const subScorePct = Math.round((newSubmission.score / newSubmission.max_score) * 100);
        student.overall_mastery = Math.round((student.overall_mastery * 0.7) + (subScorePct * 0.3));

        if (newSubmission.errors && newSubmission.errors.length > 0) {
          student.error_frequency += 1;
          const topErr = newSubmission.errors[0];
          student.common_error = typeof topErr === 'string' ? topErr : topErr.error_type || student.common_error;
          if (!student.needs_improvement.includes(student.common_error)) {
            student.needs_improvement.unshift(student.common_error);
          }
        }
      }

      // Recalculate class stats
      if (db.submissions.length > 0) {
        const totalScorePct = db.submissions.reduce((acc: number, curr: any) => acc + (curr.score / curr.max_score) * 100, 0);
        db.classStats.averageClassScore = Math.round(totalScorePct / db.submissions.length);
        db.classStats.totalAssignments = db.submissions.length;
      }

      // Persist state to Supabase Cloud
      await saveDatabaseAsync(db);

      res.json({
        success: true,
        submission: newSubmission,
      });
    } catch (error: any) {
      console.error('Error in /api/analyze-handwriting:', error);
      res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
  });

  // Override AI Grade (Teacher Human-In-The-Loop)
  app.post('/api/submissions/override', async (req, res) => {
    try {
      const { submission_id, new_score, teacher_comment } = req.body;
      const db = await getDatabaseAsync();
      const sub = db.submissions.find((s) => s.id === submission_id);
      if (!sub) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      sub.teacher_overridden = true;
      sub.teacher_score_override = new_score;
      sub.score = new_score;
      sub.teacher_comment = teacher_comment;

      // Update student profile history
      const student = db.students.find((s) => s.id === sub.student_id);
      if (student) {
        const historyItem = student.assignment_history.find((h) => h.assignment_id === sub.id);
        if (historyItem) {
          historyItem.score = new_score;
        }
      }

      await saveDatabaseAsync(db);
      res.json({ success: true, submission: sub });
    } catch (err: any) {
      console.error('Error in override grade:', err);
      res.status(500).json({ error: 'Failed to override grade' });
    }
  });

  // Generate Targeted Practice
  app.post('/api/practice/generate', async (req, res) => {
    try {
      const { student_id = 'std_1', concept = 'Sign Handling in Algebra', error_type = 'Sign Error' } = req.body;
      const db = await getDatabaseAsync();
      const student = db.students.find((s) => s.id === student_id) || db.students[0];

      const questions = await generateTargetedPracticeAI(student.name, concept, error_type);

      const newPracticeSet: any = {
        id: `prac_${Date.now()}`,
        student_id: student.id,
        student_name: student.name,
        target_concept: concept,
        target_error_type: error_type,
        reason_for_practice: `Detected repeated ${error_type} patterns during recent assignments.`,
        created_at: new Date().toISOString(),
        status: 'Pending',
        before_accuracy: 48,
        questions: questions.map((q: any, i: number) => ({
          ...q,
          id: `pq_${Date.now()}_${i}`,
        })),
      };

      db.practiceSets.unshift(newPracticeSet);
      await saveDatabaseAsync(db);

      res.json({ success: true, practiceSet: newPracticeSet });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to generate practice', details: err.message });
    }
  });

  // Submit Practice Answers & Reassess
  app.post('/api/practice/submit', async (req, res) => {
    try {
      const { practice_set_id, student_answers } = req.body;
      const db = await getDatabaseAsync();
      const practiceSet = db.practiceSets.find((p) => p.id === practice_set_id);

      if (!practiceSet) {
        return res.status(404).json({ error: 'Practice set not found' });
      }

      let correctCount = 0;
      practiceSet.questions.forEach((q) => {
        const ans = student_answers[q.id] || '';
        q.student_answer = ans;
        const isCorrect =
          ans.trim().toLowerCase() === q.expected_final_answer.trim().toLowerCase() ||
          ans.includes(q.expected_final_answer.trim());
        q.is_correct = isCorrect;
        if (isCorrect) correctCount++;
      });

      const afterAccuracy = Math.round((correctCount / practiceSet.questions.length) * 100);
      const beforeAccuracy = practiceSet.before_accuracy || 48;
      const delta = afterAccuracy - beforeAccuracy;

      practiceSet.status = 'Completed';
      practiceSet.after_accuracy = afterAccuracy;
      practiceSet.improvement_delta = delta;
      practiceSet.completed_at = new Date().toISOString();

      // Update intervention record & student mastery
      const student = db.students.find((s) => s.id === practiceSet.student_id);
      if (student) {
        student.overall_mastery = Math.min(100, Math.max(0, student.overall_mastery + Math.round(delta * 0.3)));
        if (delta > 20) {
          student.strengths.unshift(`Mastered ${practiceSet.target_concept}`);
        }
      }

      db.interventions.unshift({
        id: `int_${Date.now()}`,
        student_id: practiceSet.student_id,
        student_name: practiceSet.student_name,
        concept: practiceSet.target_concept,
        error_type: practiceSet.target_error_type,
        date_assigned: new Date().toISOString().split('T')[0],
        before_score: beforeAccuracy,
        after_score: afterAccuracy,
        status: delta > 20 ? 'SUCCESSFUL' : 'NEEDS FURTHER SUPPORT',
        notes: `Targeted practice completed (${correctCount}/${practiceSet.questions.length} correct). Improvement: +${delta}%.`,
      });

      // Recalculate intervention success rate
      if (db.interventions.length > 0) {
        const successCount = db.interventions.filter((i) => i.status === 'SUCCESSFUL').length;
        db.classStats.interventionSuccessRate = Math.round((successCount / db.interventions.length) * 100);
      }

      await saveDatabaseAsync(db);

      res.json({
        success: true,
        practiceSet,
        beforeAccuracy,
        afterAccuracy,
        improvementDelta: delta,
      });
    } catch (err: any) {
      console.error('Error submitting practice answers:', err);
      res.status(500).json({ error: 'Failed to submit practice answers' });
    }
  });

  // What-If Teaching Simulator
  app.post('/api/simulator/ask', (req, res) => {
    const { query } = req.body;
    const db = getDatabase();

    const queryLower = (query || '').toLowerCase();

    let result = {
      query,
      recommendation: 'Consider a short 15-minute factorization review before introducing full quadratic equations.',
      confidence_percentage: 89,
      prerequisite_breakdown: [
        { topic: 'Linear Equations', mastery: 92, status: 'Ready' as const },
        { topic: 'Transposition', mastery: 61, status: 'Caution' as const },
        { topic: 'Integer Operations & Signs', mastery: 55, status: 'Deficit' as const },
        { topic: 'Quadratic Prerequisites', mastery: 58, status: 'Deficit' as const },
      ],
      evidence_summary:
        '14 of 32 students in Class 8B still display sign transposition errors in linear equations. Introducing quadratic signs without resolving integer sign rules will compound error frequency by 35%.',
      actionable_steps: [
        'Run 10-minute starter drill on expanding -(x - y)',
        'Assign Group A targeted sign remediation before quadratic homework',
        'Group C (Anu, Vishal, Sanjay) can begin quadratic factoring immediately',
      ],
    };

    if (queryLower.includes('fraction')) {
      result = {
        query,
        recommendation: 'Target Group B with common denominator exercises prior to rational fraction equations.',
        confidence_percentage: 92,
        prerequisite_breakdown: [
          { topic: 'Basic Fractions', mastery: 74, status: 'Ready' as const },
          { topic: 'Common Denominator (LCM)', mastery: 48, status: 'Deficit' as const },
          { topic: 'Cross Multiplication', mastery: 62, status: 'Caution' as const },
        ],
        evidence_summary:
          '7 students consistently fail to align fraction denominators before combining terms.',
        actionable_steps: [
          'Use visual fraction fraction bar models',
          'Assign Group B the Remedial Fraction Practice set',
        ],
      };
    }

    res.json({ success: true, result });
  });

  // Automatic Remedial Assignment Generation
  app.post('/api/assignments/generate-remedial', (req, res) => {
    const { topic = 'Sign Errors & Integer Operations' } = req.body;

    const assignment = {
      id: `asg_rem_${Date.now()}`,
      title: `Remedial Assignment: ${topic} Mastery`,
      subject: 'Mathematics',
      topic,
      questions: [
        { id: 'q1', question_text: 'Solve 2x - 8 = 12', difficulty: 'Easy', correct_answer: 'x = 10', explanation: 'Add 8 to both sides: 2x = 20, then divide by 2: x = 10.' },
        { id: 'q2', question_text: 'Simplify -(4x - 9) + 2x', difficulty: 'Easy', correct_answer: '-2x + 9', explanation: 'Distribute minus sign: -4x + 9 + 2x = -2x + 9.' },
        { id: 'q3', question_text: 'Solve 15 - 3x = 27', difficulty: 'Medium', correct_answer: 'x = -4', explanation: 'Subtract 15: -3x = 12, divide by -3: x = -4.' },
        { id: 'q4', question_text: 'Simplify -2(x - 5) - 3(2 - 2x)', difficulty: 'Medium', correct_answer: '4x + 4', explanation: 'Expand both terms: -2x + 10 - 6 + 6x = 4x + 4.' },
        { id: 'q5', question_text: 'Solve 4 - 2(x + 3) = 18', difficulty: 'Hard', correct_answer: 'x = -10', explanation: 'Expand: 4 - 2x - 6 = 18 => -2x - 2 = 18 => -2x = 20 => x = -10.' },
      ],
      due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };

    res.json({ success: true, assignment });
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const startPortListening = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`GradeMate AI server running on http://localhost:${port}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use. Trying port ${port + 1}...`);
        startPortListening(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  const initialPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  startPortListening(initialPort);
}

startServer();
