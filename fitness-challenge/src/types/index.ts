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
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[]; // User IDs
  captainId: string;
  pendingRequests: string[]; // User IDs requesting to join
  brandImageUrl?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  category: 'Sports' | 'Movement' | 'Power' | 'Flow' | 'Zen' | 'WeekendDuo' | 'WeekendPhoto';
  points: number;
  duration?: number; // duration in minutes (for regular activities)
  stepCount?: number; // step count for Steps category
  bonusPoints?: number; // bonus points for step count milestones
  isWeekendChallenge?: boolean; // true for weekend bonus activities — bypass daily cap
}

export interface WeekendChallenge {
  id: string;
  weekNo: string;
  name: string;
  description: string;
  bonusPointsDesc: string;
  isVisible: boolean; // only one true at a time
}

export interface TeamBonusPoint {
  id: string;
  teamId: string;
  challengeId: string;
  points: number;
  dateStr: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: number; // timestamp
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string; // URL or base64 data for image/video
  createdAt: number; // timestamp
  weekendChallengeId?: string; // Optional: tagged to a specific weekend challenge
  likes: string[]; // user IDs who liked the post
  comments: Comment[];
}
