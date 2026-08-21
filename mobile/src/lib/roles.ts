import type { UserRole } from "@/store/use-app-store";

export const Roles = {
  ADMIN: "ADMIN",
  CONTENT: "CONTENT",
  WORKER: "WORKER",
  CUSTOMER: "CUSTOMER",
  TEST: "TEST",
  GUEST: "GUEST",
  PARTNER: "PARTNER",
  PREMIUM: "PREMIUM",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export function mapOnboardingRole(role: UserRole | null): Role {
  return role === "contractor" ? Roles.WORKER : Roles.CUSTOMER;
}
