-- Create Enums
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CurriculumStatus" AS ENUM ('Uploading', 'Reading', 'Understanding', 'Identifying_Units', 'Identifying_Topics', 'Creating_Knowledge_Base', 'Analysed', 'Failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'APPROVED', 'OVERRIDDEN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "StepStatus" AS ENUM ('correct', 'incorrect', 'partial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Curriculum" (
    "id" TEXT PRIMARY KEY,
    "teacherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "status" "CurriculumStatus" NOT NULL DEFAULT 'Reading',
    "unitsCount" INTEGER NOT NULL DEFAULT 0,
    "topicsCount" INTEGER NOT NULL DEFAULT 0,
    "conceptsCount" INTEGER NOT NULL DEFAULT 0,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CurriculumTopic" (
    "id" TEXT PRIMARY KEY,
    "curriculumId" TEXT NOT NULL REFERENCES "Curriculum"("id") ON DELETE CASCADE,
    "unit" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "concept" TEXT NOT NULL,
    "learningObjective" TEXT NOT NULL,
    "importantFormulas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expectedMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expectedKnowledgeLevel" TEXT
);

CREATE TABLE IF NOT EXISTS "CurriculumChunk" (
    "id" TEXT PRIMARY KEY,
    "curriculumId" TEXT NOT NULL REFERENCES "Curriculum"("id") ON DELETE CASCADE,
    "teacherId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Assessment" (
    "id" TEXT PRIMARY KEY,
    "teacherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "curriculumId" TEXT NOT NULL REFERENCES "Curriculum"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Question" (
    "id" TEXT PRIMARY KEY,
    "assessmentId" TEXT NOT NULL REFERENCES "Assessment"("id") ON DELETE CASCADE,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "expectedConcepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expectedMethod" TEXT
);

CREATE TABLE IF NOT EXISTS "AnswerSheet" (
    "id" TEXT PRIMARY KEY,
    "assessmentId" TEXT NOT NULL REFERENCES "Assessment"("id") ON DELETE CASCADE,
    "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Uploaded',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Evaluation" (
    "id" TEXT PRIMARY KEY,
    "answerSheetId" TEXT NOT NULL REFERENCES "AnswerSheet"("id") ON DELETE CASCADE,
    "questionId" TEXT NOT NULL REFERENCES "Question"("id") ON DELETE CASCADE,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "overallFeedback" TEXT NOT NULL,
    "aiConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.92,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EvaluationStep" (
    "id" TEXT PRIMARY KEY,
    "evaluationId" TEXT NOT NULL REFERENCES "Evaluation"("id") ON DELETE CASCADE,
    "stepNumber" INTEGER NOT NULL,
    "studentWork" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'correct',
    "errorType" TEXT,
    "marks" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL,
    "correction" TEXT
);

CREATE TABLE IF NOT EXISTS "StudentTopicProgress" (
    "id" TEXT PRIMARY KEY,
    "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "curriculumId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "weaknessLevel" TEXT NOT NULL DEFAULT 'Developing',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and Grant Permissions
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Curriculum" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumTopic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CurriculumChunk" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnswerSheet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evaluation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EvaluationStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentTopicProgress" ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- Public RLS Policies
DO $$ BEGIN
    CREATE POLICY "Allow public access User" ON "User" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access Curriculum" ON "Curriculum" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access CurriculumTopic" ON "CurriculumTopic" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access CurriculumChunk" ON "CurriculumChunk" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access Assessment" ON "Assessment" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access Question" ON "Question" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access AnswerSheet" ON "AnswerSheet" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access Evaluation" ON "Evaluation" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access EvaluationStep" ON "EvaluationStep" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public access StudentTopicProgress" ON "StudentTopicProgress" FOR ALL TO public USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
