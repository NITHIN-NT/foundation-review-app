export interface Question {
  id: number;
  text: string;
  module_id: number;
  answer: string | null;
}

export type ReviewStatus = 'answered' | 'need-improvement' | 'wrong' | 'skip';

export interface ScheduledReview {
  id: string;
  studentName: string;
  module: string;
  batch: string;
  status: 'pending' | 'ongoing' | 'completed' | 'failed';
  date: string;
  scheduledAt?: string;
  scores?: {
    theoretical: number;
    maxTheoretical: number;
    practical: number;
    total: number;
  };
  notes?: string;
  session_data?: Record<string, unknown>;
}

export interface QuestionResult {
  questionId: number;
  status: ReviewStatus;
  score: number;
}

export interface ReviewSession {
  reviewId: string;
  results: QuestionResult[];
  practicalMark: number;
  practicalLink: string;
  startTime: number;
  notes: string;
}

// API Types
export interface CreateReviewRequest {
  student_name: string;
  batch: string;
  module: string;
  status: string;
  scheduled_at: string;
}

export interface UpdateReviewRequest {
  status?: 'pending' | 'active' | 'completed' | 'failed';
  student_name?: string;
  batch?: string;
  module?: string;
  scores?: {
    theoretical: number;
    maxTheoretical: number;
    practical: number;
    total: number;
  };
  notes?: string;
  session_data?: Record<string, unknown>;
  scheduled_at?: string;
}
