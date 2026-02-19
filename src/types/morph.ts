import { MorphCategory } from '../constants/categories';

export type PhotoSource = 'camera' | 'gallery';

export interface Morph {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  category: MorphCategory;
  color: string;
  before_url: string | null;
  after_url: string | null;
  before_taken_with: PhotoSource | null;
  after_taken_with: PhotoSource | null;
  before_date: string;
  after_date: string | null;
  goal_date: string | null;
  is_verified: boolean;
  is_ongoing: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressPhoto {
  id: string;
  morph_id: string;
  photo_url: string;
  taken_with: PhotoSource;
  taken_at: string;
  note: string | null;
}

export interface MorphDraft {
  title: string;
  note: string;
  category: MorphCategory | null;
  color: string;
  goal_date: Date | null;
  is_ongoing: boolean;
  before_uri: string | null;
  before_taken_with: PhotoSource | null;
}

export interface MorphStats {
  total: number;
  ongoing: number;
  completed: number;
}

export type FilterTab = 'all' | 'ongoing' | 'completed';
