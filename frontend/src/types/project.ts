export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  jira_project_id?: string;
  user_id: number;
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: string;
  jira_project_id?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  jira_project_id?: string;
}