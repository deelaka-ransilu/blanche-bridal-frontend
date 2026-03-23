export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  publicId: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  emailVerified: boolean;
  profileCompleted: boolean;
}

export interface User {
  publicId: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  emailVerified: boolean;
  profileCompleted: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}
