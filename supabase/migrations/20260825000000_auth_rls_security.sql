-- Migration: Comprehensive Database Policies for GradeMate AI

-- 1. Create Class Table if not exists
CREATE TABLE IF NOT EXISTS "Class" (
    "id" TEXT PRIMARY KEY,
    "teacherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create ClassMember Table if not exists
CREATE TABLE IF NOT EXISTS "ClassMember" (
    "id" TEXT PRIMARY KEY,
    "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
    "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_class_student" UNIQUE ("classId", "studentId")
);

-- Grant privileges to all roles
GRANT ALL ON TABLE "User" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Curriculum" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CurriculumTopic" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "CurriculumChunk" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Assessment" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Question" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "AnswerSheet" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Evaluation" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "EvaluationStep" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "StudentTopicProgress" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "Class" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "ClassMember" TO anon, authenticated, postgres, service_role;

-- Enable Row Level Security on all tables
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
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassMember" ENABLE ROW LEVEL SECURITY;

-- 3. Create Storage Bucket and Storage Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('grademate_data', 'grademate_data', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Allow public storage select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'grademate_data');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public storage insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'grademate_data');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public storage update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'grademate_data') WITH CHECK (bucket_id = 'grademate_data');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. Database RLS Policies granting full access for API & App operations

-- User Table Policies
DO $$ BEGIN CREATE POLICY "Public User Select" ON "User" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public User Insert" ON "User" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public User Update" ON "User" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public User Delete" ON "User" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Curriculum Table Policies
DO $$ BEGIN CREATE POLICY "Public Curriculum Select" ON "Curriculum" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Curriculum Insert" ON "Curriculum" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Curriculum Update" ON "Curriculum" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Curriculum Delete" ON "Curriculum" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CurriculumTopic Table Policies
DO $$ BEGIN CREATE POLICY "Public CurriculumTopic Select" ON "CurriculumTopic" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumTopic Insert" ON "CurriculumTopic" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumTopic Update" ON "CurriculumTopic" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumTopic Delete" ON "CurriculumTopic" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CurriculumChunk Table Policies
DO $$ BEGIN CREATE POLICY "Public CurriculumChunk Select" ON "CurriculumChunk" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumChunk Insert" ON "CurriculumChunk" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumChunk Update" ON "CurriculumChunk" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public CurriculumChunk Delete" ON "CurriculumChunk" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Assessment Table Policies
DO $$ BEGIN CREATE POLICY "Public Assessment Select" ON "Assessment" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Assessment Insert" ON "Assessment" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Assessment Update" ON "Assessment" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Assessment Delete" ON "Assessment" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Question Table Policies
DO $$ BEGIN CREATE POLICY "Public Question Select" ON "Question" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Question Insert" ON "Question" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Question Update" ON "Question" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Question Delete" ON "Question" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AnswerSheet Table Policies
DO $$ BEGIN CREATE POLICY "Public AnswerSheet Select" ON "AnswerSheet" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public AnswerSheet Insert" ON "AnswerSheet" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public AnswerSheet Update" ON "AnswerSheet" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public AnswerSheet Delete" ON "AnswerSheet" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Evaluation Table Policies
DO $$ BEGIN CREATE POLICY "Public Evaluation Select" ON "Evaluation" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Evaluation Insert" ON "Evaluation" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Evaluation Update" ON "Evaluation" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Evaluation Delete" ON "Evaluation" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- EvaluationStep Table Policies
DO $$ BEGIN CREATE POLICY "Public EvaluationStep Select" ON "EvaluationStep" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public EvaluationStep Insert" ON "EvaluationStep" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public EvaluationStep Update" ON "EvaluationStep" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public EvaluationStep Delete" ON "EvaluationStep" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Class & ClassMember Policies
DO $$ BEGIN CREATE POLICY "Public Class Select" ON "Class" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Class Insert" ON "Class" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Class Update" ON "Class" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public Class Delete" ON "Class" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE POLICY "Public ClassMember Select" ON "ClassMember" FOR SELECT TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public ClassMember Insert" ON "ClassMember" FOR INSERT TO public WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public ClassMember Update" ON "ClassMember" FOR UPDATE TO public USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Public ClassMember Delete" ON "ClassMember" FOR DELETE TO public USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
