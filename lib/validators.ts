import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  collegeId: z.string().optional().or(z.literal("")),
  courseId: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
  source: z.enum(["FORM", "WHATSAPP"]).default("FORM"),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type EnquiryFormData = z.infer<typeof enquirySchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const collegeSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  description: z.string().min(10, "Description is required"),
  address: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CollegeFormData = z.infer<typeof collegeSchema>;

export const courseSchema = z.object({
  collegeId: z.string().min(1, "College is required"),
  name: z.string().min(2, "Course name is required").max(200),
  duration: z.string().min(1, "Duration is required").max(100),
  description: z.string().optional(),
  eligibility: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const aboutSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  vision: z.string().min(10),
  mission: z.string().min(10),
});

export type AboutFormData = z.infer<typeof aboutSchema>;

export const contactSchema = z.object({
  address: z.string().min(5),
  phones: z.array(z.string().min(10)).min(1),
  emails: z.array(z.string().email()),
  whatsappNumber: z.string().optional(),
  whatsappGreeting: z.string().min(5),
  workingHours: z.string().optional(),
  mapEmbedUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  youtube: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactSchema>;
