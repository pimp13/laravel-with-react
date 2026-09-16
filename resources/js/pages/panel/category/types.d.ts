export interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  parent_id: number | null;
  posts_count: number;
  is_active: boolean;
  created_at: string;
}