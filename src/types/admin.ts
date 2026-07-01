export interface AdminUser {
  id: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  firstName: string;
  lastName: string;
  phone: string;
  address: string | null;
  active: boolean; // ⚠️ verify against real JSON — may need to be "isActive"
  createdAt: string;
}

export interface Measurement {
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

export interface CustomerDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  active: boolean; // ⚠️ same caveat as above
  createdAt: string;
  adminNotes: string | null;
  designImageUrls: string[];
  measurements: Measurement[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CreateWalkInInput {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}