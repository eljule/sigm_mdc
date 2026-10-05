export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  allowedModules: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}
