"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validators";

export async function loginAction(data: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { error: "Invalid email or password" };
  }

  const passwordValid = await compare(password, admin.passwordHash);
  if (!passwordValid) {
    return { error: "Invalid email or password" };
  }

  const token = await createSession(admin.id, admin.email);
  await setSessionCookie(token);

  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
