export interface Reminder {
  id: string; // UUID from Supabase or temp-id
  title: string;
  datetime: string; // ISO format
  user_id: string;
  created_at?: string;
  updated_at?: string;
  is_synced?: boolean; // true = Supabase synced, false = only local
  is_deleted?: boolean; // used for deletion sync
}


export enum Methods {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
  GUEST = "GUEST",
}

export type Form = {
  email: string;
  password: string;
  display_name?: string;
  dob?: string;
};

export type User = {
  id: string;
  email: string;
  display_name: string;
  dob?: string;
  is_guest?: boolean;
  refresh_token?: string; // for Google/Apple
  // reminders: Reminder[];
};

export interface Reminder {
    id: string;
    user_id: string;
    name: string;
    notes?: string | null;
    is_recurring: boolean;
    recurrence_pattern?: string | null;
    start_date: string;
    end_date?: string | null;
    is_active: boolean;
    created_at?: string;
    doses?: ReminderDose[];
}

export interface ReminderDose {
    id: string;
    reminder_id: string;
    time: string; // e.g., "15:04"
    dosage: string;
    notes?: string | null;
    created_at: string;
}