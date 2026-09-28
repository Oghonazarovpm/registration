export interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
