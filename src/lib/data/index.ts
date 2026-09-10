import "server-only";

import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import * as demo from "./demo-repo";
import * as supa from "./supabase-repo";

/**
 * Unified data access. Routes to Supabase when configured, otherwise to the
 * in-memory demo store so the product is fully explorable before a database is
 * connected. Mutations live in src/lib/data/mutations.ts.
 *
 * Reads are wrapped in React `cache()` so a layout and its page that need the
 * same data only hit the database once per request.
 */

export const DEMO_MODE = !isSupabaseConfigured;

const repo = isSupabaseConfigured ? supa : demo;

export const getProfile = cache(repo.getProfile);
export const listProjects = cache(repo.listProjects);
export const getProject = cache(repo.getProject);
export const getFeedback = cache(repo.getFeedback);
export const getActivities = cache(repo.getActivities);
export const getRevisions = cache(repo.getRevisions);
export const getClients = cache(repo.getClients);
export const getNotifications = cache(repo.getNotifications);
export const getDashboardStats = cache(repo.getDashboardStats);
export const getRecentFeedback = cache(repo.getRecentFeedback);
export const getRecentActivity = cache(repo.getRecentActivity);
