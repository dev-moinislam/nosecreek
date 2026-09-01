import {
  SiteSettings,
  Service,
  TeamMember,
  BlogPost,
  Location,
  Condition,
  Testimonial
} from "@/types/content";

export type UserRole = "admin" | "client";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
}

export type FormType =
  | "contact"
  | "appointment"
  | "workshop_registration"
  | "workshop_replay"
  | "discovery_call"
  | "general";

export type LeadStatus =
  | "new"
  | "contacted"
  | "in_progress"
  | "replied"
  | "converted"
  | "archived";

export interface LeadReply {
  id: string;
  sent_at: string;
  sent_by: string;
  subject: string;
  body: string;
  channel: "email" | "sms" | "phone_note";
}

export interface Lead {
  id: string;
  form_type: FormType;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  service_interest?: string;
  message?: string;
  metadata?: Record<string, any>;
  status: LeadStatus;
  notes?: string;
  reply_history?: LeadReply[];
  created_at: string;
  updated_at?: string;
}

export interface DatabaseTables {
  site_settings: SiteSettings & { id: string; updated_at?: string };
  services: Service & { order?: number; is_published?: boolean; updated_at?: string };
  conditions: Condition & { order?: number; is_published?: boolean; updated_at?: string };
  locations: Location & { is_published?: boolean; updated_at?: string };
  team_members: TeamMember & { is_published?: boolean; updated_at?: string };
  blog_posts: BlogPost & { is_published?: boolean; updated_at?: string };
  testimonials: Testimonial & { is_published?: boolean; updated_at?: string };
  form_submissions: Lead;
  user_profiles: UserProfile;
}
