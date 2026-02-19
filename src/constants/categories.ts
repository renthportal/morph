export type MorphCategory =
  | 'fitness'
  | 'health'
  | 'style'
  | 'space'
  | 'plant'
  | 'project'
  | 'art'
  | 'other';

export interface CategoryInfo {
  key: MorphCategory;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'fitness', icon: '💪', color: '#E8634A' },
  { key: 'health', icon: '❤️', color: '#4CAF50' },
  { key: 'style', icon: '✂️', color: '#AA96DA' },
  { key: 'space', icon: '🏠', color: '#4ECDC4' },
  { key: 'plant', icon: '🌱', color: '#95E1D3' },
  { key: 'project', icon: '🔨', color: '#FFC107' },
  { key: 'art', icon: '🎨', color: '#FF6B9D' },
  { key: 'other', icon: '📌', color: '#C4A882' },
];

export const getCategoryInfo = (key: MorphCategory): CategoryInfo =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
