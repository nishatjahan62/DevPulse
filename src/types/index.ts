
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
  created_at: Date;
  updated_at: Date;
}


export interface Issue {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}


export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter: {
    id: number;
    name: string;
    role: string;
  };
  created_at: Date;
  updated_at: Date;
}


export interface JwtPayload {
  id: number;
  name: string;
  role: string;
}


export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: 'bug' | 'feature_request';
}

export interface IssueQueryParams {
  sort?: 'newest' | 'oldest';
  type?: 'bug' | 'feature_request';
  status?: 'open' | 'in_progress' | 'resolved';
}