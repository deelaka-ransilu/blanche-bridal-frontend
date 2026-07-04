import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiRequest } from "@/lib/api/client";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export async function getEmployees(): Promise<Employee[]> {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken as string | undefined;

  const result = await apiRequest<Employee[]>("/api/admin/employees", { method: "GET" }, token);
  return result.success ? result.data : [];
}