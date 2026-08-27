-- Migration: Add teacherId column to User table in Supabase PostgreSQL

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teacher_id" TEXT;

-- Optional index to speed up teacher-scoped student queries
CREATE INDEX IF NOT EXISTS "idx_user_teacher_id" ON "User"("teacherId");
CREATE INDEX IF NOT EXISTS "idx_user_teacher_id_snake" ON "User"("teacher_id");
