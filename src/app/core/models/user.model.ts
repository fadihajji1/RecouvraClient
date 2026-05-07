export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'agent' | 'manager' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'agent' | 'manager' | 'admin';
}
