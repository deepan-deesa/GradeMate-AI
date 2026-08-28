export type Role = 'TEACHER' | 'STUDENT';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  avatar?: string;
}

export type FeedbackMode = 'Encouraging' | 'Concise' | 'Socratic' | 'Detailed' | 'Exam-oriented';

export interface EvaluationSettings {
  feedbackMode: FeedbackMode;
  partialCreditStrictness: 'Generous' | 'Balanced' | 'Strict';
  autoFlagReview: boolean;
}

export type ErrorCategory = 
  | 'Sign Error'
  | 'Arithmetic Error'
  | 'Fraction Error'
  | 'Conceptual Error'
  | 'Missing Step'
  | 'Algebraic Error'
  | 'Calculation Error'
  | 'Incorrect Formula'
  | 'Transcription Error'
  | 'Unclear Handwriting'
  | 'One-Time Slip'
  | 'Recurring Error';

export type ErrorSeverity = 'One-Time Error' | 'Recurring Error' | 'Self-Corrected';

export interface StudentStepAnalysis {
  step_number: number;
  expression: string;
  correct: boolean;
  marks_awarded: number;
  max_marks: number;
  error_type?: ErrorCategory | null;
  explanation: string;
  math_validation?: {
    is_valid: boolean;
    expected_expression?: string;
    note?: string;
  };
}

export interface ThinkingTrace {
  attempt_number: number;
  visible_work: string;
  is_crossed_out: boolean;
  status: 'Incorrect' | 'Self-corrected' | 'Final Answer';
  note: string;
}

export interface LearningGapDetail {
  concept: string;
  topic: string;
  confidence: number;
  evidence: string[];
  prerequisite_weakness?: string;
  recommendation: string;
}

export interface GradingRubricItem {
  criterion: string;
  max_marks: number;
  awarded_marks: number;
  reason: string;
}

export interface SubmissionAnalysis {
  id: string;
  submission_id?: string;
  student_id: string;
  student_name: string;
  assignment_id: string;
  assignment_title: string;
  topic: string;
  question: string;
  image_url: string;
  student_steps: StudentStepAnalysis[];
  thinking_traces: ThinkingTrace[];
  final_answer: string;
  final_answer_correct: boolean;
  score: number;
  max_score: number;
  rubric: GradingRubricItem[];
  errors: {
    category: ErrorCategory;
    description: string;
    severity: ErrorSeverity;
  }[];
  learning_gap: LearningGapDetail;
  feedback: string;
  socratic_hint?: string;
  ai_confidence: number;
  teacher_review_required: boolean;
  teacher_overridden?: boolean;
  teacher_score_override?: number;
  teacher_comment?: string;
  curriculum_id?: string;
  curriculum_name?: string;
  question_paper_id?: string;
  question_paper_title?: string;
  extracted_question?: string;
  extracted_topic?: string;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  teacherId?: string;
  teacher_id?: string;
  isRegistered?: boolean;
  userStatus?: string;
  class?: string;
  grade_level: string;
  overall_mastery: number; // percentage
  overallAccuracy?: number;
  totalEvaluations?: number;
  strengths: string[];
  needs_improvement: string[];
  common_error: ErrorCategory;
  error_frequency: number;
  assignments_completed: number;
  learning_velocity: string;
  early_support_alert: boolean;
  alert_reason?: string;
  error_dna: {
    category: ErrorCategory;
    percentage: number;
    count: number;
  }[];
  topic_mastery: {
    topic: string;
    mastery_percentage: number;
  }[];
  assignment_history: {
    assignment_id: string;
    assignment_title: string;
    score: number;
    max_score: number;
    date: string;
  }[];
  prerequisite_graph: ConceptNode[];
}

export interface ConceptNode {
  id: string;
  name: string;
  mastery: number;
  status: 'Mastered' | 'Developing' | 'Needs Support';
  prerequisites?: string[];
  children?: ConceptNode[];
}

export interface StudentGroup {
  id: string;
  name: string;
  level: 'NEEDS SUPPORT' | 'DEVELOPING' | 'READY FOR ADVANCED';
  common_issue: string;
  students: {
    id: string;
    name: string;
    mastery: number;
    avatar?: string;
  }[];
  topic_weakness: string;
  recommended_activity: string;
}

export interface NextBestAction {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  action_title: string;
  reason: string;
  evidence: string;
  suggested_action: string;
  affected_students_count: number;
  affected_students_names: string[];
  related_topic: string;
}

export interface PracticeQuestion {
  id: string;
  question_number: number;
  question_text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  target_error_type: ErrorCategory;
  hint: string;
  step_by_step_solution: string;
  expected_final_answer: string;
  student_answer?: string;
  student_steps_submitted?: string;
  is_correct?: boolean;
  ai_feedback?: string;
  options?: string[];
  correct_option?: number;
  explanation?: string;
}

export interface PracticeSet {
  id: string;
  student_id: string;
  student_name: string;
  target_concept: string;
  target_error_type: ErrorCategory;
  reason_for_practice: string;
  created_at: string;
  status: 'Pending' | 'Completed';
  questions: PracticeQuestion[];
  before_accuracy: number;
  after_accuracy?: number;
  improvement_delta?: number;
  completed_at?: string;
  completed?: boolean;
  topic?: string;
  target_reason?: string;
}

export interface InterventionRecord {
  id: string;
  student_id: string;
  student_name: string;
  concept: string;
  error_type: ErrorCategory;
  date_assigned: string;
  before_score: number;
  after_score?: number;
  status: 'SUCCESSFUL' | 'IN PROGRESS' | 'NEEDS FURTHER SUPPORT';
  notes: string;
}

export interface Curriculum {
  id: string;
  teacherId: string;
  name: string;
  board: string;
  class: string;
  subject: string;
  academicYear: string;
  fileUrl?: string;
  fileName?: string;
  status: 'Uploading' | 'Reading' | 'Understanding' | 'Identifying Units' | 'Identifying Topics' | 'Creating Knowledge Base' | 'Analysed' | 'Failed';
  unitsCount: number;
  topicsCount: number;
  conceptsCount: number;
  createdAt: string;
  rawText?: string;
}

export interface CurriculumTopic {
  id: string;
  curriculumId: string;
  unit: string;
  topic: string;
  subtopic?: string;
  concept: string;
  learningObjective: string;
  importantFormulas?: string[];
  expectedMethods?: string[];
  expectedKnowledgeLevel?: string;
}

export interface CurriculumChunk {
  id: string;
  curriculumId: string;
  teacherId: string;
  unit: string;
  topic: string;
  content: string;
}

export interface QuestionItem {
  id: string;
  assessmentId: string;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  unit: string;
  topic: string;
  expectedConcepts: string[];
  expectedMethod?: string;
}

export interface StructuredEvaluationResponse {
  score: number;
  maxScore: number;
  overallStatus: 'correct' | 'partial' | 'incorrect';
  steps: {
    stepNumber: number;
    status: 'correct' | 'incorrect' | 'partial';
    errorType?: string;
    feedback: string;
    correction?: string;
    marks: number;
  }[];
  overallFeedback: string;
}

export interface Assignment {
  id: string;
  teacherId?: string;
  curriculumId: string;
  title: string;
  subject: string;
  topic: string;
  total_submissions: number;
  average_score: number;
  max_marks: number;
  due_date: string;
  questions: {
    id: string;
    question_text: string;
    max_marks: number;
    rubric_guidelines: string;
    unit?: string;
    topic?: string;
  }[];
}

export interface SimulatorQueryResponse {
  query: string;
  recommendation: string;
  confidence_percentage: number;
  prerequisite_breakdown: {
    topic: string;
    mastery: number;
    status: 'Ready' | 'Caution' | 'Deficit';
  }[];
  evidence_summary: string;
  actionable_steps: string[];
}
