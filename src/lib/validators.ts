import { z } from "zod";
import { timeControls } from "./utils";

export const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, dashes and underscores allowed");

export const signupSchema = z.object({
  username: usernameSchema,
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password too short")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter")
    .regex(/[0-9]/, "Add a number"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean(),
});

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
  remember: z.boolean().optional(),
});

export const queueSchema = z.object({
  mode: z.enum(["RANKED", "CASUAL", "FRIEND"]),
  timeControl: z
    .string()
    .refine((v) => timeControls.some((t) => t.value === v), "Invalid time control"),
  friendId: z.string().optional(),
});

export const moveSchema = z.object({
  from: z.string(),
  to: z.string(),
  promotion: z.string().optional(),
});

export const settingsSchema = z.object({
  boardTheme: z.string(),
  pieceSet: z.string(),
  animationsEnabled: z.boolean(),
  soundsEnabled: z.boolean(),
  showCoordinates: z.boolean(),
  moveConfirmation: z.boolean(),
  allowFriendRequests: z.boolean(),
  discoverable: z.boolean(),
  showOnlineStatus: z.boolean(),
  inAppNotifications: z.boolean(),
  language: z.string(),
  timezone: z.string(),
  defaultTheme: z.string(),
});
