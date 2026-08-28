import {
  StudentProfile,
  Assignment,
  SubmissionAnalysis,
  StudentGroup,
  NextBestAction,
  InterventionRecord,
  PracticeSet,
  Curriculum,
  CurriculumTopic,
  CurriculumChunk,
  QuestionItem,
  EvaluationSettings,
} from '../src/types';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'TEACHER' | 'STUDENT';
  studentId?: string;
  createdAt: string;
}

export interface TeacherStudentRel {
  id: string;
  teacherId: string;
  studentId: string;
  createdAt?: string;
}

export interface AppDatabase {
  users: UserAccount[];
  teacherStudents: TeacherStudentRel[];
  evaluationSettings?: EvaluationSettings;
  curricula: Curriculum[];
  curriculumTopics: CurriculumTopic[];
  curriculumChunks: CurriculumChunk[];
  questions: QuestionItem[];
  students: StudentProfile[];
  assignments: Assignment[];
  submissions: SubmissionAnalysis[];
  groups: StudentGroup[];
  nextBestActions: NextBestAction[];
  interventions: InterventionRecord[];
  practiceSets: PracticeSet[];
  questionPapers?: any[];
  invitations?: any[];
  otpRequests?: any[];
  classStats: {
    totalStudents: number;
    totalAssignments: number;
    averageClassScore: number;
    commonLearningGap: string;
    studentsNeedingSupport: number;
    interventionSuccessRate: number;
  };
}

// Handwritten SVG mock image generator so UI renders real handwritten look papers!
export function generateHandwrittenPaperSvg(
  studentName: string,
  question: string,
  steps: { line: string; isCorrect: boolean }[]
): string {
  const stepSvg = steps
    .map((s, idx) => {
      const y = 140 + idx * 45;
      const strokeColor = s.isCorrect ? '#1e293b' : '#dc2626';
      return `<g transform="translate(40, ${y})">
        <text font-family="'Caveat', 'Comic Sans MS', cursive, sans-serif" font-size="22" fill="${strokeColor}" font-weight="600">${s.line}</text>
        ${
          !s.isCorrect
            ? `<line x1="0" y1="-5" x2="220" y2="-5" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4,2"/>
               <text x="230" y="0" font-family="'Caveat', cursive" font-size="16" fill="#dc2626">❌ (Err)</text>`
            : `<text x="230" y="0" font-family="'Caveat', cursive" font-size="16" fill="#16a34a">✓</text>`
        }
      </g>`;
    })
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%" style="background:#fefcf6; border:1px solid #e2e8f0; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    <!-- Lined notebook paper background -->
    <defs>
      <pattern id="lines" width="600" height="30" patternUnits="userSpaceOnUse">
        <line x1="0" y1="29" x2="600" y2="29" stroke="#e2e8f0" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="600" height="380" fill="#faf8f5" />
    <rect width="600" height="380" fill="url(#lines)" />
    <!-- Red margin line -->
    <line x1="80" y1="0" x2="80" y2="380" stroke="#fca5a5" stroke-width="1.5" />

    <!-- Paper Header -->
    <text x="95" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">Name: <tspan font-family="'Caveat', cursive" font-size="20" fill="#1e3a8a">${studentName}</tspan></text>
    <text x="420" y="35" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">Date: <tspan font-family="'Caveat', cursive" font-size="18">Today</tspan></text>
    <line x1="20" y1="50" x2="580" y2="50" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- Question -->
    <text x="95" y="80" font-family="sans-serif" font-size="13" font-weight="bold" fill="#475569">Q: ${question}</text>
    <line x1="95" y1="90" x2="550" y2="90" stroke="#94a3b8" stroke-dasharray="2,2"/>

    <!-- Handwritten steps -->
    ${stepSvg}
  </svg>`;

  let base64 = '';
  if (typeof btoa === 'function') {
    base64 = btoa(unescape(encodeURIComponent(svg)));
  } else if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
  return `data:image/svg+xml;base64,${base64}`;
}

import {
  loadDatabaseFromSupabase,
  saveDatabaseToSupabase,
  clearSupabaseDatabase,
  getEmptyDatabase,
} from './supabaseDb';

let currentDb: AppDatabase = getEmptyDatabase();
let isInitialized = false;

export async function initDatabaseAsync(): Promise<AppDatabase> {
  if (!isInitialized) {
    currentDb = await loadDatabaseFromSupabase();
    isInitialized = true;
  }
  return currentDb;
}

export function getDatabase(): AppDatabase {
  if (!isInitialized) {
    initDatabaseAsync().catch((err) =>
      console.error('[Supabase DB] Error in background init:', err)
    );
  }
  return currentDb;
}

export async function getDatabaseAsync(): Promise<AppDatabase> {
  return await initDatabaseAsync();
}

export async function saveDatabaseAsync(db?: AppDatabase): Promise<boolean> {
  if (db) {
    currentDb = db;
  }
  return await saveDatabaseToSupabase(currentDb);
}

export async function clearDatabaseAsync(): Promise<AppDatabase> {
  currentDb = await clearSupabaseDatabase();
  isInitialized = true;
  return currentDb;
}

export function resetDatabaseToDemo(): AppDatabase {
  currentDb = getEmptyDatabase();
  saveDatabaseAsync(currentDb).catch((err) =>
    console.error('[Supabase DB] Error saving cleared state:', err)
  );
  return currentDb;
}
