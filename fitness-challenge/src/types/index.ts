export type WorkStream =
  | 'Catalyst'
  | 'Cloud'
  | 'Contact Center'
  | 'Data'
  | 'EYP'
  | 'Growth Protocol'
  | 'ITOPS'
  | 'OCE'
  | 'Pricing'
  | 'Risk'
  | 'SCO'
  | 'Tax'
  | 'TMO';

export type Location = 'US' | 'Mexico' | 'India' | 'Global';

export interface User {
  id: string;
  name: string;           // display name (kept for backward compat — equals fullName or username)
  fullName?: string;
  email?: string;
  contactNumber?: string;
  username?: string;       // unique login username
  password?: string;
  workStream: WorkStream;
  location: Location;
  teamId?: string | null;
  role?: 'admin' | 'user';
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // User IDs
  captainId: string;
  pendingRequests: string[]; // User IDs requesting to join
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  category: 'Movement' | 'Power' | 'Flow' | 'Zen' | 'WeekendDuo' | 'WeekendPhoto';
  points: number;
  duration?: number; // duration in minutes (for regular activities)
  isWeekendChallenge?: boolean; // true for weekend bonus activities — bypass daily cap
}
