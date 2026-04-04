import { AuthResponse, User } from "@/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockLogin(
  email: string,
  _password: string,
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
  await delay(300);

  const mockUsers: Record<string, AuthResponse> = {
    "superadmin@blanchebridal.com": {
      token: "mock-token-superadmin",
      role: "SUPERADMIN",
    },
    "admin@blanchebridal.com": { token: "mock-token-admin", role: "ADMIN" },
    "employee@blanchebridal.com": {
      token: "mock-token-employee",
      role: "EMPLOYEE",
    },
    "customer@blanchebridal.com": {
      token: "mock-token-customer",
      role: "CUSTOMER",
    },
  };

  const user = mockUsers[email];
  if (!user) return { success: false, error: "Invalid credentials" };
  return { success: true, data: user };
}

export async function mockGetProfile(): Promise<User> {
  await delay(300);
  return {
    id: "mock-uuid-123",
    email: "superadmin@blanchebridal.com",
    role: "SUPERADMIN",
    firstName: "Super",
    lastName: "Admin",
    phone: "0771234567",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
}
