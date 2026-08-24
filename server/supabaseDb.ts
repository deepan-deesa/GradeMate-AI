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

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

export function getEmptyDatabase(): AppDatabase {
  return {
    users: [],
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

async function ensureBucketExists() {
  try {
    const supabase = getSupabaseClient();
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('[Supabase] Warning checking buckets:', error.message);
      return;
    }
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (createErr) {
        console.warn('[Supabase] Could not create bucket:', createErr.message);
      } else {
        console.log(`[Supabase] Created bucket "${BUCKET_NAME}"`);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase] Error ensuring bucket exists:', err.message);
  }
}

export async function loadDatabaseFromSupabase(): Promise<AppDatabase> {
  try {
    const supabase = getSupabaseClient();
    await ensureBucketExists();

    const { data, error } = await supabase.storage.from(BUCKET_NAME).download(FILE_PATH);

    if (error || !data) {
      console.log('[Supabase] No existing database found in Supabase. Initializing clean state...');
      const cleanDb = getEmptyDatabase();
      await saveDatabaseToSupabase(cleanDb);
      return cleanDb;
    }

    const text = await data.text();
    const parsed = JSON.parse(text);
    console.log('[Supabase] Successfully loaded database state from Supabase Cloud!');
    return {
      ...getEmptyDatabase(),
      ...parsed,
    };
  } catch (err: any) {
    console.error('[Supabase] Failed to load database from Supabase, returning clean empty state:', err.message);
    return getEmptyDatabase();
  }
}

export async function saveDatabaseToSupabase(db: AppDatabase): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    await ensureBucketExists();

    const jsonString = JSON.stringify(db, null, 2);
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(FILE_PATH, jsonString, {
      contentType: 'application/json',
      upsert: true,
    });

    if (error) {
      console.error('[Supabase] Failed to save database to Supabase:', error.message);
      return false;
    }

    console.log('[Supabase] Successfully persisted database to Supabase!');
    return true;
  } catch (err: any) {
    console.error('[Supabase] Error saving database to Supabase:', err.message);
    return false;
  }
}

export async function clearSupabaseDatabase(): Promise<AppDatabase> {
  const cleanDb = getEmptyDatabase();
  await saveDatabaseToSupabase(cleanDb);
  console.log('[Supabase] Cleared database and reset to clean empty state in Supabase!');
  return cleanDb;
}
