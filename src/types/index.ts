import { string } from "zod";

export type UserRole = "SUPERADMIN" | "ADMIN" | "EMPLOYEE" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  role: UserRole;
}

export interface Measurements {
  id: string;
  publicId: string;
  customerId: string;
  heightWithShoes: number | null;
  hollowToHem: number | null;
  fullBust: number | null;
  underBust: number | null;
  naturalWaist: number | null;
  fullHip: number | null;
  shoulderWidth: number | null;
  torsoLength: number | null;
  thighCircumference: number | null;
  waistToKnee: number | null;
  waistToFloor: number | null;
  armhole: number | null;
  bicepCircumference: number | null;
  elbowCircumference: number | null;
  wristCircumference: number | null;
  sleeveLength: number | null;
  upperBust: number | null;
  bustApexDistance: number | null;
  shoulderToBustPoint: number | null;
  neckCircumference: number | null;
  trainLength: number | null;
  notes: string | null;
  measuredAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  fields?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
