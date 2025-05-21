export type Reminder = {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // 24h format: "HH:MM"
  startDate: string; // ISO format
  endDate: string;
  notes?: string;
  isRecurring: boolean;
  isActive: boolean;
};
