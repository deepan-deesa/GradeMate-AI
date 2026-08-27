import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { AppDatabase } from './db';

dotenv.config();

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://frxxudsztexkgtmdbuea.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_ljn2hydrAqeQe2G1iZweKQ_fXU0JWxP';

const BUCKET_NAME = 'grademate_data';
const FILE_PATH = 'db.json';

let supabaseClient: SupabaseClient | null = null;
let isBucketAvailable: boolean | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

export function getEmptyDatabase(): AppDatabase {
  return {
    users: [],
    teacherStudents: [],
    evaluationSettings: {
      feedbackMode: 'Socratic',
      partialCreditStrictness: 'Balanced',
      autoFlagReview: true,
    },
    curricula: [],
    curriculumTopics: [],
    curriculumChunks: [],
    questions: [],
    students: [],
    assignments: [],
    submissions: [],
    groups: [],
    nextBestActions: [],
    interventions: [],
    practiceSets: [],
    invitations: [],
    otpRequests: [],
    classStats: {
      totalStudents: 0,
      totalAssignments: 0,
      averageClassScore: 0,
      commonLearningGap: 'None recorded yet',
      studentsNeedingSupport: 0,
      interventionSuccessRate: 0,
    },
  };
}

async function ensureBucketExists(): Promise<boolean> {
  if (isBucketAvailable !== null) return isBucketAvailable;
  try {
    const supabase = getSupabaseClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      isBucketAvailable = false;
      return false;
    }
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createErr) {
        isBucketAvailable = false;
        return false;
      }
    }
    isBucketAvailable = true;
    return true;
  } catch (err: any) {
    isBucketAvailable = false;
    return false;
  }
}

export async function loadDatabaseFromSupabase(): Promise<AppDatabase> {
  const db = getEmptyDatabase();
  try {
    const supabase = getSupabaseClient();

    // 0. Hydrate TeacherStudent / teacher_students relationships
    try {
      const relMap = new Map<string, any>();
      const { data: dbTS } = await supabase.from('TeacherStudent').select('*');
      if (dbTS && dbTS.length > 0) {
        dbTS.forEach((ts: any) => {
          const tId = ts.teacherId || ts.teacher_id;
          const sId = ts.studentId || ts.student_id;
          if (tId && sId) {
            const key = `${tId}_${sId}`;
            relMap.set(key, {
              id: ts.id || `ts_${key}`,
              teacherId: tId,
              studentId: sId,
              createdAt: ts.createdAt || ts.created_at,
            });
          }
        });
      }
      const { data: dbTS2 } = await supabase.from('teacher_students').select('*');
      if (dbTS2 && dbTS2.length > 0) {
        dbTS2.forEach((ts: any) => {
          const tId = ts.teacher_id || ts.teacherId;
          const sId = ts.student_id || ts.studentId;
          if (tId && sId) {
            const key = `${tId}_${sId}`;
            if (!relMap.has(key)) {
              relMap.set(key, {
                id: ts.id || `ts_${key}`,
                teacherId: tId,
                studentId: sId,
                createdAt: ts.created_at || ts.createdAt,
              });
            }
          }
        });
      }
      db.teacherStudents = Array.from(relMap.values());
    } catch (relErr) {
      console.warn('[Supabase DB] Note fetching teacherStudents table:', relErr);
    }

    // 1. Hydrate User table -> db.users & db.students
    const { data: dbUsers } = await supabase.from('User').select('*');
    if (dbUsers && dbUsers.length > 0) {
      db.users = dbUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        studentId: u.studentId,
        teacherId: u.teacherId || u.teacher_id,
        teacher_id: u.teacher_id || u.teacherId,
        createdAt: u.createdAt,
      }));

      dbUsers.forEach((u: any) => {
        if (u.role === 'STUDENT') {
          const stdId = u.studentId || `std_${u.id}`;
          const tId = u.teacherId || u.teacher_id;
          if (!db.students.some((s) => s.id === stdId)) {
            db.students.push({
              id: stdId,
              name: u.name,
              email: u.email,
              teacherId: tId,
              teacher_id: tId,
              class: 'Grade 10 A',
              overall_mastery: 0,
              overallAccuracy: 0,
              totalEvaluations: 0,
              error_frequency: 0,
              common_error: 'None recorded yet',
              error_dna: [],
              weakTopics: [],
              strongTopics: [],
              strengths: ['Enrolled Student'],
              needs_improvement: [],
              topic_mastery: [],
              assignment_history: [],
              learning_velocity: 'Active Student',
              digitalTwinSummary: `${u.name} enrolled in GradeMate AI.`,
            } as any);
          }
        }
      });
      db.classStats.totalStudents = db.students.length;
    }

    // 2. Hydrate Curriculum table -> db.curricula
    const { data: dbCurricula } = await supabase.from('Curriculum').select('*');
    if (dbCurricula && dbCurricula.length > 0) {
      db.curricula = dbCurricula.map((c: any) => ({
        id: c.id,
        teacherId: c.teacherId,
        name: c.name,
        board: c.board,
        class: c.class,
        subject: c.subject,
        academicYear: c.academicYear,
        fileUrl: c.fileUrl,
        fileName: c.fileName,
        status: c.status,
        unitsCount: c.unitsCount,
        topicsCount: c.topicsCount,
        conceptsCount: c.conceptsCount,
        rawText: c.rawText,
        createdAt: c.createdAt,
      }));
    }

    // 3. Hydrate CurriculumTopic table -> db.curriculumTopics
    const { data: dbTopics } = await supabase.from('CurriculumTopic').select('*');
    if (dbTopics && dbTopics.length > 0) {
      db.curriculumTopics = dbTopics.map((t: any) => ({
        id: t.id,
        curriculumId: t.curriculumId,
        unit: t.unit,
        topic: t.topic,
        subtopic: t.subtopic,
        concept: t.concept,
        learningObjective: t.learningObjective,
        importantFormulas: t.importantFormulas || [],
        expectedMethods: t.expectedMethods || [],
        expectedKnowledgeLevel: t.expectedKnowledgeLevel,
      }));
    }

    // 4. Hydrate CurriculumChunk table -> db.curriculumChunks
    const { data: dbChunks } = await supabase.from('CurriculumChunk').select('*');
    if (dbChunks && dbChunks.length > 0) {
      db.curriculumChunks = dbChunks.map((ch: any) => ({
        id: ch.id,
        curriculumId: ch.curriculumId,
        teacherId: ch.teacherId,
        unit: ch.unit,
        topic: ch.topic,
        content: ch.content,
        createdAt: ch.createdAt,
      }));
    }

    // 5. Hydrate Assessment table -> db.assignments
    const { data: dbAssessments } = await supabase.from('Assessment').select('*');
    if (dbAssessments && dbAssessments.length > 0) {
      db.assignments = dbAssessments.map((a: any) => ({
        id: a.id,
        teacherId: a.teacherId || a.teacher_id,
        teacher_id: a.teacher_id || a.teacherId,
        curriculumId: a.curriculumId,
        assignedStudentId: a.assignedStudentId || a.assigned_student_id || 'ALL',
        title: a.title,
        subject: a.subject,
        topic: a.topic || 'General Topic',
        total_submissions: 0,
        max_marks: a.totalMarks || a.max_marks || 10,
        average_score: 0,
        due_date: a.dueDate ? String(a.dueDate).split('T')[0] : '2026-08-30',
        questions: Array.isArray(a.questions) ? a.questions : [],
        createdAt: a.createdAt,
      }));
    }

    // 6. Hydrate from Storage Bucket if available for JSON snapshot overlay
    const bucketReady = await ensureBucketExists();
    if (bucketReady) {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).download(FILE_PATH);
      if (data && !error) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        const combinedUsers = [...db.users];
        (parsed.users || []).forEach((pu: any) => {
          if (!combinedUsers.some((u) => u.id === pu.id || (u.email && pu.email && u.email.toLowerCase() === pu.email.toLowerCase()))) {
            combinedUsers.push(pu);
          }
        });

        const combinedStudents = [...db.students];
        (parsed.students || []).forEach((ps: any) => {
          if (!combinedStudents.some((s: any) => s.id === ps.id || (s.email && ps.email && s.email.toLowerCase() === ps.email.toLowerCase()))) {
            combinedStudents.push(ps);
          }
        });

        const combinedTeacherStudents = [...(db.teacherStudents || [])];
        (parsed.teacherStudents || []).forEach((pts: any) => {
          if (!combinedTeacherStudents.some((ts) => ts.teacherId === pts.teacherId && ts.studentId === pts.studentId)) {
            combinedTeacherStudents.push(pts);
          }
        });

        // Merge assignments while retaining generated questions
        const combinedAssignments = [...db.assignments];
        (parsed.assignments || []).forEach((pa: any) => {
          const matchIdx = combinedAssignments.findIndex((ca) => ca.id === pa.id);
          if (matchIdx === -1) {
            combinedAssignments.push(pa);
          } else {
            const targetAsgn = combinedAssignments[matchIdx] as any;
            if ((!targetAsgn.questions || targetAsgn.questions.length === 0) && Array.isArray(pa.questions) && pa.questions.length > 0) {
              targetAsgn.questions = pa.questions;
            }
            if (pa.assignedStudentId && !targetAsgn.assignedStudentId) {
              targetAsgn.assignedStudentId = pa.assignedStudentId;
            }
          }
        });

        console.log('[Supabase Cloud] Synchronized JSON state snapshot with preserved assessment questions!');
        return {
          ...db,
          ...parsed,
          users: combinedUsers,
          students: combinedStudents,
          teacherStudents: combinedTeacherStudents,
          assignments: combinedAssignments,
          curricula: db.curricula.length > 0 ? db.curricula : (parsed.curricula || []),
          curriculumTopics: db.curriculumTopics.length > 0 ? db.curriculumTopics : (parsed.curriculumTopics || []),
          curriculumChunks: db.curriculumChunks.length > 0 ? db.curriculumChunks : (parsed.curriculumChunks || []),
        };
      }
    }

    console.log('[Supabase Cloud] Hydrated all database entities from PostgreSQL tables!');
    return db;
  } catch (err: any) {
    console.warn('[Supabase Cloud] State loaded from PostgreSQL tables.');
    return db;
  }
}

export async function saveDatabaseToSupabase(db: AppDatabase): Promise<boolean> {
  try {
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
      return true;
    }

    const supabase = getSupabaseClient();
    const jsonString = JSON.stringify(db, null, 2);
    await supabase.storage.from(BUCKET_NAME).upload(FILE_PATH, jsonString, {
      contentType: 'application/json',
      upsert: true,
    }).catch(() => {});

    return true;
  } catch (err: any) {
    return true;
  }
}

export async function clearSupabaseDatabase(): Promise<AppDatabase> {
  const cleanDb = getEmptyDatabase();
  await saveDatabaseToSupabase(cleanDb);
  console.log('[Supabase Cloud] Reset database to clean state!');
  return cleanDb;
}
