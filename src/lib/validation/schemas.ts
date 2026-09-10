import { z } from "zod";

export const deviceModeSchema = z.enum(["desktop", "tablet", "mobile"]);
export const feedbackStatusSchema = z.enum(["open", "in_progress", "resolved"]);

const urlLike = z
  .string()
  .trim()
  .min(1, "Website URL is required")
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .refine((value) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid website URL");

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is too short").max(120),
  client_name: z.string().trim().min(2, "Client name is required").max(120),
  client_email: z.string().trim().email("Enter a valid client email"),
  website_url: urlLike,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  deadline: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  website_url: urlLike.optional(),
  deadline: z.string().optional().or(z.literal("")),
  status: z
    .enum(["draft", "in_progress", "waiting_for_client", "changes_requested", "approved"])
    .optional(),
});

export const createFeedbackSchema = z.object({
  project_id: z.string().uuid().optional(),
  page_url: z.string().trim().max(2048),
  device: deviceModeSchema,
  element_selector: z.string().trim().max(512).nullable().optional(),
  position_x: z.number().min(0).max(100),
  position_y: z.number().min(0).max(100),
  comment: z.string().trim().min(1, "Add a comment").max(2000),
  author_name: z.string().trim().min(1).max(120).optional(),
});
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const updateFeedbackSchema = z.object({
  status: feedbackStatusSchema,
});

export const createReplySchema = z.object({
  message: z.string().trim().min(1, "Write a reply").max(2000),
  author_name: z.string().trim().min(1).max(120).optional(),
});

export const approveProjectSchema = z.object({
  approved_by_name: z.string().trim().min(2, "Enter your name").max(120),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const createRevisionSchema = z.object({
  label: z.string().trim().min(2, "Add a revision label").max(120),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  company_name: z.string().trim().max(120).optional().or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const notificationPrefsSchema = z.object({
  email_enabled: z.boolean(),
  on_client_approval: z.boolean(),
  on_new_feedback: z.boolean(),
  on_feedback_reply: z.boolean(),
});

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = authSchema.extend({
  full_name: z.string().trim().min(2, "Enter your name").max(120),
});
