export interface AdminUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  active: boolean; // matches backend's @JsonProperty("active") — NOT "isActive"
  createdAt: string;
}