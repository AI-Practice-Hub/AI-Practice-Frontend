export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  user_id: number;
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
}