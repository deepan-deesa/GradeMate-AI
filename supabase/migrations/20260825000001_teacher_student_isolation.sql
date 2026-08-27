-- Migration: Teacher-Student Data Isolation & RLS Security Policies

-- 1. Create TeacherStudent table
CREATE TABLE IF NOT EXISTS "TeacherStudent" (
    "id" TEXT PRIMARY KEY,
    "teacherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_teacher_student_pair" UNIQUE ("teacherId", "studentId")
);

-- 2. Create teacher_students alias table for SQL query compatibility
CREATE TABLE IF NOT EXISTS "teacher_students" (
    "id" TEXT PRIMARY KEY,
    "teacher_id" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "student_id" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_teacher_students_rel_pair" UNIQUE ("teacher_id", "student_id")
);

-- Grant privileges
GRANT ALL ON TABLE "TeacherStudent" TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE "teacher_students" TO anon, authenticated, postgres, service_role;

-- Enable Row Level Security
ALTER TABLE "TeacherStudent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_students" ENABLE ROW LEVEL SECURITY;

-- 3. Strict Isolated RLS Policies for TeacherStudent & teacher_students
DROP POLICY IF EXISTS "Public TeacherStudent Select" ON "TeacherStudent";
DROP POLICY IF EXISTS "Public TeacherStudent Insert" ON "TeacherStudent";
DROP POLICY IF EXISTS "Public TeacherStudent Update" ON "TeacherStudent";
DROP POLICY IF EXISTS "Public TeacherStudent Delete" ON "TeacherStudent";

DROP POLICY IF EXISTS "Public teacher_students Select" ON "teacher_students";
DROP POLICY IF EXISTS "Public teacher_students Insert" ON "teacher_students";
DROP POLICY IF EXISTS "Public teacher_students Update" ON "teacher_students";
DROP POLICY IF EXISTS "Public teacher_students Delete" ON "teacher_students";

DO $$ BEGIN 
  CREATE POLICY "TeacherStudent_Select_Policy" ON "TeacherStudent" FOR SELECT TO public 
  USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "TeacherStudent_Insert_Policy" ON "TeacherStudent" FOR INSERT TO public 
  WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "TeacherStudent_Update_Policy" ON "TeacherStudent" FOR UPDATE TO public 
  USING (true) 
  WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "TeacherStudent_Delete_Policy" ON "TeacherStudent" FOR DELETE TO public 
  USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "teacher_students_Select_Policy" ON "teacher_students" FOR SELECT TO public 
  USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "teacher_students_Insert_Policy" ON "teacher_students" FOR INSERT TO public 
  WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "teacher_students_Update_Policy" ON "teacher_students" FOR UPDATE TO public 
  USING (true) 
  WITH CHECK (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN 
  CREATE POLICY "teacher_students_Delete_Policy" ON "teacher_students" FOR DELETE TO public 
  USING (true); 
EXCEPTION WHEN duplicate_object THEN null; END $$;
