'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Team, ActivityLog, WeekendChallenge, TeamBonusPoint, Post, Comment, Award } from '../types';
import { useLocalStorage, generateMockId } from './useLocalStorage';
import { fetchAllData, seedInitialData, logActivityDB, registerUserDB, updateProfileDB, createTeamDB, createPostDB, addCommentDB } from '@/actions/db';

interface AppState {
    currentUser: User | null;
    users: User[];
    teams: Team[];
    activities: ActivityLog[];
    isWeekendChallengePublished: boolean;
    weekendChallenges: WeekendChallenge[];
    teamBonusPoints: TeamBonusPoint[];
    posts: Post[];
    awards: Award[];
}

interface ResetToken {
    token: string;
    userId: string;
    expiresAt: number; // timestamp
}

interface AppContextType extends AppState {
    loginUser: (name: string, password?: string) => { success: boolean; message?: string };
    registerUser: (userData: Omit<User, 'id'>) => { success: boolean; message?: string };
    logoutUser: () => void;
    requestPasswordReset: (emailOrUsername: string) => { success: boolean; message?: string; resetLink?: string };
    resetPassword: (token: string, newPassword: string) => { success: boolean; message?: string };
    updateProfile: (updates: { fullName?: string; contactNumber?: string; workStream?: User['workStream']; location?: User['location']; avatarUrl?: string }) => { success: boolean; message?: string };
    changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message?: string };
    createTeam: (name: string, brandImageUrl?: string) => string;
    updateTeam: (teamId: string, updates: { name?: string; brandImageUrl?: string }) => { success: boolean; message?: string };
    requestJoinTeam: (teamId: string) => { success: boolean; message?: string };
    leaveTeam: () => { success: boolean; message?: string };
    approveJoinRequest: (teamId: string, userId: string) => { success: boolean; message?: string };
    rejectJoinRequest: (teamId: string, userId: string) => void;
    transferCaptain: (teamId: string, newCaptainId: string) => void;
    removeMember: (teamId: string, userId: string) => { success: boolean; message?: string };
    logActivity: (activity: Omit<ActivityLog, 'id' | 'userId'>) => { success: boolean; message?: string };
    toggleWeekendChallenge: (published: boolean) => void;
    createWeekendChallenge: (data: Omit<WeekendChallenge, 'id'>) => void;
    updateWeekendChallenge: (id: string, data: Partial<WeekendChallenge>) => void;
    deleteWeekendChallenge: (id: string) => void;
    setWeekendChallengeVisibility: (id: string, isVisible: boolean) => void;
    awardTeamBonusPoint: (data: Omit<TeamBonusPoint, 'id'>) => void;
    removeTeamBonusPoint: (id: string) => void;
    createPost: (data: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
    addComment: (postId: string, content: string) => void;
    toggleLikePost: (postId: string) => void;
    addAward: (data: Omit<Award, 'id'>) => void;
    removeAward: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data to populate the app


const initialUsers: User[] = [
    {
        "id": "admin",
        "name": "admin",
        "username": "admin",
        "password": "admin123",
        "location": "Global",
        "workStream": "Cloud",
        "teamId": null,
        "role": "admin"
    },
    {
        "id": "u_sandeep",
        "name": "Sandeep Pashine",
        "username": "spashine",
        "password": "sandeep123",
        "location": "US",
        "workStream": "Cloud",
        "teamId": "t1",
        "role": "user"
    },
    {
        "id": "u_1",
        "name": "User u_1",
        "username": "useru_1",
        "password": "password",
        "location": "US",
        "workStream": "OCE",
        "teamId": "t1",
        "role": "user"
    },
    {
        "id": "u_2",
        "name": "User u_2",
        "username": "useru_2",
        "password": "password",
        "location": "US",
        "workStream": "Data",
        "teamId": "t1",
        "role": "user"
    },
    {
        "id": "u_3",
        "name": "User u_3",
        "username": "useru_3",
        "password": "password",
        "location": "India",
        "workStream": "Growth Protocol",
        "teamId": "t1",
        "role": "user"
    },
    {
        "id": "u_4",
        "name": "User u_4",
        "username": "useru_4",
        "password": "password",
        "location": "India",
        "workStream": "Risk",
        "teamId": null,
        "role": "user"
    },
    {
        "id": "u_5",
        "name": "User u_5",
        "username": "useru_5",
        "password": "password",
        "location": "US",
        "workStream": "OCE",
        "teamId": "t2",
        "role": "user"
    },
    {
        "id": "u_6",
        "name": "User u_6",
        "username": "useru_6",
        "password": "password",
        "location": "Mexico",
        "workStream": "Catalyst",
        "teamId": "t2",
        "role": "user"
    },
    {
        "id": "u_7",
        "name": "User u_7",
        "username": "useru_7",
        "password": "password",
        "location": "US",
        "workStream": "EYP",
        "teamId": "t2",
        "role": "user"
    },
    {
        "id": "u_8",
        "name": "User u_8",
        "username": "useru_8",
        "password": "password",
        "location": "US",
        "workStream": "Contact Center",
        "teamId": "t2",
        "role": "user"
    },
    {
        "id": "u_9",
        "name": "User u_9",
        "username": "useru_9",
        "password": "password",
        "location": "India",
        "workStream": "Risk",
        "teamId": null,
        "role": "user"
    },
    {
        "id": "u_10",
        "name": "User u_10",
        "username": "useru_10",
        "password": "password",
        "location": "India",
        "workStream": "Catalyst",
        "teamId": "t3",
        "role": "user"
    },
    {
        "id": "u_11",
        "name": "User u_11",
        "username": "useru_11",
        "password": "password",
        "location": "India",
        "workStream": "TMO",
        "teamId": "t3",
        "role": "user"
    },
    {
        "id": "u_12",
        "name": "User u_12",
        "username": "useru_12",
        "password": "password",
        "location": "US",
        "workStream": "Tax",
        "teamId": "t3",
        "role": "user"
    },
    {
        "id": "u_13",
        "name": "User u_13",
        "username": "useru_13",
        "password": "password",
        "location": "US",
        "workStream": "TMO",
        "teamId": "t3",
        "role": "user"
    },
    {
        "id": "u_14",
        "name": "User u_14",
        "username": "useru_14",
        "password": "password",
        "location": "US",
        "workStream": "TMO",
        "teamId": null,
        "role": "user"
    },
    {
        "id": "u_15",
        "name": "User u_15",
        "username": "useru_15",
        "password": "password",
        "location": "Mexico",
        "workStream": "EYP",
        "teamId": "t4",
        "role": "user"
    },
    {
        "id": "u_16",
        "name": "User u_16",
        "username": "useru_16",
        "password": "password",
        "location": "US",
        "workStream": "EYP",
        "teamId": "t4",
        "role": "user"
    },
    {
        "id": "u_17",
        "name": "User u_17",
        "username": "useru_17",
        "password": "password",
        "location": "India",
        "workStream": "Catalyst",
        "teamId": "t4",
        "role": "user"
    },
    {
        "id": "u_18",
        "name": "User u_18",
        "username": "useru_18",
        "password": "password",
        "location": "Mexico",
        "workStream": "Pricing",
        "teamId": "t4",
        "role": "user"
    },
    {
        "id": "u_19",
        "name": "User u_19",
        "username": "useru_19",
        "password": "password",
        "location": "Mexico",
        "workStream": "Contact Center",
        "teamId": null,
        "role": "user"
    },
    {
        "id": "u_20",
        "name": "User u_20",
        "username": "useru_20",
        "password": "password",
        "location": "Mexico",
        "workStream": "Growth Protocol",
        "teamId": "t5",
        "role": "user"
    },
    {
        "id": "u_21",
        "name": "User u_21",
        "username": "useru_21",
        "password": "password",
        "location": "US",
        "workStream": "ITOPS",
        "teamId": "t5",
        "role": "user"
    },
    {
        "id": "u_22",
        "name": "User u_22",
        "username": "useru_22",
        "password": "password",
        "location": "US",
        "workStream": "Risk",
        "teamId": "t5",
        "role": "user"
    },
    {
        "id": "u_23",
        "name": "User u_23",
        "username": "useru_23",
        "password": "password",
        "location": "Mexico",
        "workStream": "Pricing",
        "teamId": "t5",
        "role": "user"
    },
    {
        "id": "u_24",
        "name": "User u_24",
        "username": "useru_24",
        "password": "password",
        "location": "Mexico",
        "workStream": "Tax",
        "teamId": null,
        "role": "user"
    },
    {
        "id": "u_25",
        "name": "User u_25",
        "username": "useru_25",
        "password": "password",
        "location": "India",
        "workStream": "Pricing",
        "teamId": "t6",
        "role": "user"
    },
    {
        "id": "u_26",
        "name": "User u_26",
        "username": "useru_26",
        "password": "password",
        "location": "India",
        "workStream": "Growth Protocol",
        "teamId": "t6",
        "role": "user"
    },
    {
        "id": "u_27",
        "name": "User u_27",
        "username": "useru_27",
        "password": "password",
        "location": "India",
        "workStream": "ITOPS",
        "teamId": "t6",
        "role": "user"
    },
    {
        "id": "u_28",
        "name": "User u_28",
        "username": "useru_28",
        "password": "password",
        "location": "India",
        "workStream": "Pricing",
        "teamId": "t6",
        "role": "user"
    },
    {
        "id": "u_29",
        "name": "User u_29",
        "username": "useru_29",
        "password": "password",
        "location": "US",
        "workStream": "Data",
        "teamId": null,
        "role": "user"
    }
];

const initialTeams: Team[] = [
    {
        "id": "t1",
        "name": "Team Alpha",
        "members": [
            "u_sandeep",
            "u_1",
            "u_2",
            "u_3"
        ],
        "captainId": "u_sandeep",
        "pendingRequests": []
    },
    {
        "id": "t2",
        "name": "Team Bravo",
        "members": [
            "u_5",
            "u_6",
            "u_7",
            "u_8"
        ],
        "captainId": "u_5",
        "pendingRequests": []
    },
    {
        "id": "t3",
        "name": "Team Charlie",
        "members": [
            "u_10",
            "u_11",
            "u_12",
            "u_13"
        ],
        "captainId": "u_10",
        "pendingRequests": []
    },
    {
        "id": "t4",
        "name": "Team Delta",
        "members": [
            "u_15",
            "u_16",
            "u_17",
            "u_18"
        ],
        "captainId": "u_15",
        "pendingRequests": []
    },
    {
        "id": "t5",
        "name": "Team Echo",
        "members": [
            "u_20",
            "u_21",
            "u_22",
            "u_23"
        ],
        "captainId": "u_20",
        "pendingRequests": []
    },
    {
        "id": "t6",
        "name": "Team Foxtrot",
        "members": [
            "u_25",
            "u_26",
            "u_27",
            "u_28"
        ],
        "captainId": "u_25",
        "pendingRequests": []
    }
];

const initialActivities: ActivityLog[] = [
    {
        "id": "a_1",
        "userId": "u_sandeep",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_2",
        "userId": "u_sandeep",
        "date": "2026-02-02",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_3",
        "userId": "u_sandeep",
        "date": "2026-02-02",
        "category": "Power",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_4",
        "userId": "u_1",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_5",
        "userId": "u_1",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_6",
        "userId": "u_2",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_7",
        "userId": "u_2",
        "date": "2026-02-02",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_8",
        "userId": "u_2",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_9",
        "userId": "u_2",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_10",
        "userId": "u_2",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_11",
        "userId": "u_3",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_12",
        "userId": "u_3",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_13",
        "userId": "u_3",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_14",
        "userId": "u_4",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_15",
        "userId": "u_4",
        "date": "2026-02-02",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_16",
        "userId": "u_5",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_17",
        "userId": "u_5",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_18",
        "userId": "u_6",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_19",
        "userId": "u_7",
        "date": "2026-02-02",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_20",
        "userId": "u_7",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_21",
        "userId": "u_9",
        "date": "2026-02-02",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_22",
        "userId": "u_9",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_23",
        "userId": "u_9",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_24",
        "userId": "u_10",
        "date": "2026-02-02",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_25",
        "userId": "u_10",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_26",
        "userId": "u_10",
        "date": "2026-02-02",
        "category": "Power",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_27",
        "userId": "u_11",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_28",
        "userId": "u_11",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_29",
        "userId": "u_15",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_30",
        "userId": "u_15",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_31",
        "userId": "u_15",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_32",
        "userId": "u_16",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_33",
        "userId": "u_16",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_34",
        "userId": "u_17",
        "date": "2026-02-02",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_35",
        "userId": "u_17",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_36",
        "userId": "u_18",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_37",
        "userId": "u_18",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_38",
        "userId": "u_20",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_39",
        "userId": "u_20",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_40",
        "userId": "u_21",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_41",
        "userId": "u_21",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_42",
        "userId": "u_22",
        "date": "2026-02-02",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_43",
        "userId": "u_22",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_44",
        "userId": "u_25",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_45",
        "userId": "u_25",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_46",
        "userId": "u_25",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_47",
        "userId": "u_26",
        "date": "2026-02-02",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_48",
        "userId": "u_26",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_49",
        "userId": "u_26",
        "date": "2026-02-02",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_50",
        "userId": "u_27",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_51",
        "userId": "u_27",
        "date": "2026-02-02",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_52",
        "userId": "u_27",
        "date": "2026-02-02",
        "category": "Sports",
        "points": 20,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_53",
        "userId": "u_28",
        "date": "2026-02-02",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_54",
        "userId": "u_28",
        "date": "2026-02-02",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_55",
        "userId": "u_sandeep",
        "date": "2026-02-03",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_56",
        "userId": "u_sandeep",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_57",
        "userId": "u_sandeep",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_58",
        "userId": "u_1",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_59",
        "userId": "u_2",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_60",
        "userId": "u_2",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_61",
        "userId": "u_4",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_62",
        "userId": "u_4",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_63",
        "userId": "u_4",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_64",
        "userId": "u_4",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_65",
        "userId": "u_5",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_66",
        "userId": "u_5",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_67",
        "userId": "u_5",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_68",
        "userId": "u_6",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_69",
        "userId": "u_6",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_70",
        "userId": "u_6",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 35,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_71",
        "userId": "u_7",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_72",
        "userId": "u_7",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_73",
        "userId": "u_7",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_74",
        "userId": "u_7",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_75",
        "userId": "u_8",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_76",
        "userId": "u_8",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_77",
        "userId": "u_8",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_78",
        "userId": "u_8",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_79",
        "userId": "u_10",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_80",
        "userId": "u_10",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_81",
        "userId": "u_10",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_82",
        "userId": "u_11",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_83",
        "userId": "u_11",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_84",
        "userId": "u_15",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_85",
        "userId": "u_15",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_86",
        "userId": "u_15",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_87",
        "userId": "u_16",
        "date": "2026-02-03",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_88",
        "userId": "u_16",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_89",
        "userId": "u_17",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_90",
        "userId": "u_17",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_91",
        "userId": "u_18",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_92",
        "userId": "u_18",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_93",
        "userId": "u_18",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_94",
        "userId": "u_19",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_95",
        "userId": "u_19",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_96",
        "userId": "u_19",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_97",
        "userId": "u_20",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_98",
        "userId": "u_20",
        "date": "2026-02-03",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_99",
        "userId": "u_20",
        "date": "2026-02-03",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_100",
        "userId": "u_20",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_101",
        "userId": "u_20",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_102",
        "userId": "u_23",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_103",
        "userId": "u_23",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_104",
        "userId": "u_23",
        "date": "2026-02-03",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_105",
        "userId": "u_25",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_106",
        "userId": "u_25",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_107",
        "userId": "u_25",
        "date": "2026-02-03",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_108",
        "userId": "u_26",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_109",
        "userId": "u_26",
        "date": "2026-02-03",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_110",
        "userId": "u_26",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_111",
        "userId": "u_27",
        "date": "2026-02-03",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_112",
        "userId": "u_27",
        "date": "2026-02-03",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_113",
        "userId": "u_27",
        "date": "2026-02-03",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_114",
        "userId": "u_sandeep",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_115",
        "userId": "u_sandeep",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_116",
        "userId": "u_1",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_117",
        "userId": "u_1",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_118",
        "userId": "u_4",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_119",
        "userId": "u_4",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_120",
        "userId": "u_4",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_121",
        "userId": "u_4",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_122",
        "userId": "u_5",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_123",
        "userId": "u_5",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_124",
        "userId": "u_6",
        "date": "2026-02-04",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_125",
        "userId": "u_6",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_126",
        "userId": "u_6",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_127",
        "userId": "u_7",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_128",
        "userId": "u_7",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_129",
        "userId": "u_8",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_130",
        "userId": "u_8",
        "date": "2026-02-04",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_131",
        "userId": "u_8",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_132",
        "userId": "u_10",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_133",
        "userId": "u_10",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_134",
        "userId": "u_15",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_135",
        "userId": "u_15",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_136",
        "userId": "u_15",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_137",
        "userId": "u_15",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_138",
        "userId": "u_16",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_139",
        "userId": "u_16",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_140",
        "userId": "u_16",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_141",
        "userId": "u_17",
        "date": "2026-02-04",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_142",
        "userId": "u_17",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_143",
        "userId": "u_17",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 20,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_144",
        "userId": "u_18",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_145",
        "userId": "u_19",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_146",
        "userId": "u_19",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_147",
        "userId": "u_19",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_148",
        "userId": "u_19",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_149",
        "userId": "u_19",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_150",
        "userId": "u_20",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_151",
        "userId": "u_23",
        "date": "2026-02-04",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_152",
        "userId": "u_25",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_153",
        "userId": "u_25",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 40,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_154",
        "userId": "u_27",
        "date": "2026-02-04",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_155",
        "userId": "u_27",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_156",
        "userId": "u_27",
        "date": "2026-02-04",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_157",
        "userId": "u_28",
        "date": "2026-02-04",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_158",
        "userId": "u_28",
        "date": "2026-02-04",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_159",
        "userId": "u_29",
        "date": "2026-02-04",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_160",
        "userId": "u_sandeep",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_161",
        "userId": "u_sandeep",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_162",
        "userId": "u_sandeep",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_163",
        "userId": "u_1",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_164",
        "userId": "u_1",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_165",
        "userId": "u_4",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_166",
        "userId": "u_4",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_167",
        "userId": "u_5",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_168",
        "userId": "u_5",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_169",
        "userId": "u_5",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_170",
        "userId": "u_6",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_171",
        "userId": "u_6",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_172",
        "userId": "u_6",
        "date": "2026-02-05",
        "category": "Power",
        "points": 25,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_173",
        "userId": "u_7",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_174",
        "userId": "u_7",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_175",
        "userId": "u_8",
        "date": "2026-02-05",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_176",
        "userId": "u_8",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_177",
        "userId": "u_8",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_178",
        "userId": "u_10",
        "date": "2026-02-05",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_179",
        "userId": "u_10",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_180",
        "userId": "u_10",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_181",
        "userId": "u_12",
        "date": "2026-02-05",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_182",
        "userId": "u_12",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_183",
        "userId": "u_12",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_184",
        "userId": "u_15",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_185",
        "userId": "u_15",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_186",
        "userId": "u_16",
        "date": "2026-02-05",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_187",
        "userId": "u_16",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_188",
        "userId": "u_16",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_189",
        "userId": "u_16",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_190",
        "userId": "u_17",
        "date": "2026-02-05",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_191",
        "userId": "u_17",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_192",
        "userId": "u_17",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_193",
        "userId": "u_17",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_194",
        "userId": "u_18",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_195",
        "userId": "u_20",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_196",
        "userId": "u_20",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_197",
        "userId": "u_20",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_198",
        "userId": "u_20",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_199",
        "userId": "u_21",
        "date": "2026-02-05",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_200",
        "userId": "u_21",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_201",
        "userId": "u_21",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_202",
        "userId": "u_22",
        "date": "2026-02-05",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_203",
        "userId": "u_22",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_204",
        "userId": "u_22",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_205",
        "userId": "u_24",
        "date": "2026-02-05",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_206",
        "userId": "u_25",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_207",
        "userId": "u_25",
        "date": "2026-02-05",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_208",
        "userId": "u_25",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_209",
        "userId": "u_26",
        "date": "2026-02-05",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_210",
        "userId": "u_26",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_211",
        "userId": "u_26",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_212",
        "userId": "u_27",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_213",
        "userId": "u_27",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_214",
        "userId": "u_27",
        "date": "2026-02-05",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_215",
        "userId": "u_28",
        "date": "2026-02-05",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_216",
        "userId": "u_28",
        "date": "2026-02-05",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_217",
        "userId": "u_sandeep",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_218",
        "userId": "u_sandeep",
        "date": "2026-02-06",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_219",
        "userId": "u_2",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_220",
        "userId": "u_2",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_221",
        "userId": "u_2",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_222",
        "userId": "u_3",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_223",
        "userId": "u_4",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_224",
        "userId": "u_4",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_225",
        "userId": "u_4",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_226",
        "userId": "u_5",
        "date": "2026-02-06",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_227",
        "userId": "u_5",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_228",
        "userId": "u_6",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_229",
        "userId": "u_6",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_230",
        "userId": "u_6",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_231",
        "userId": "u_6",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_232",
        "userId": "u_7",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_233",
        "userId": "u_7",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_234",
        "userId": "u_7",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_235",
        "userId": "u_9",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_236",
        "userId": "u_9",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_237",
        "userId": "u_9",
        "date": "2026-02-06",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_238",
        "userId": "u_10",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_239",
        "userId": "u_10",
        "date": "2026-02-06",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_240",
        "userId": "u_10",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_241",
        "userId": "u_10",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_242",
        "userId": "u_12",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_243",
        "userId": "u_12",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_244",
        "userId": "u_12",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_245",
        "userId": "u_14",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_246",
        "userId": "u_14",
        "date": "2026-02-06",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_247",
        "userId": "u_15",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_248",
        "userId": "u_15",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_249",
        "userId": "u_15",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_250",
        "userId": "u_15",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_251",
        "userId": "u_15",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_252",
        "userId": "u_16",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_253",
        "userId": "u_16",
        "date": "2026-02-06",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_254",
        "userId": "u_16",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_255",
        "userId": "u_17",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_256",
        "userId": "u_17",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_257",
        "userId": "u_17",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_258",
        "userId": "u_17",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_259",
        "userId": "u_19",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_260",
        "userId": "u_19",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_261",
        "userId": "u_19",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_262",
        "userId": "u_20",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_263",
        "userId": "u_20",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_264",
        "userId": "u_20",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_265",
        "userId": "u_20",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_266",
        "userId": "u_21",
        "date": "2026-02-06",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_267",
        "userId": "u_21",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_268",
        "userId": "u_21",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_269",
        "userId": "u_22",
        "date": "2026-02-06",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_270",
        "userId": "u_23",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_271",
        "userId": "u_23",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_272",
        "userId": "u_23",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_273",
        "userId": "u_23",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_274",
        "userId": "u_25",
        "date": "2026-02-06",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_275",
        "userId": "u_25",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_276",
        "userId": "u_26",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_277",
        "userId": "u_26",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_278",
        "userId": "u_26",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_279",
        "userId": "u_27",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_280",
        "userId": "u_27",
        "date": "2026-02-06",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_281",
        "userId": "u_27",
        "date": "2026-02-06",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_282",
        "userId": "u_27",
        "date": "2026-02-06",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_283",
        "userId": "u_sandeep",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_284",
        "userId": "u_sandeep",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_285",
        "userId": "u_sandeep",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_286",
        "userId": "u_sandeep",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_287",
        "userId": "u_sandeep",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_288",
        "userId": "u_1",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_289",
        "userId": "u_1",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_290",
        "userId": "u_1",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_291",
        "userId": "u_2",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_292",
        "userId": "u_2",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_293",
        "userId": "u_2",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_294",
        "userId": "u_2",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_295",
        "userId": "u_3",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_296",
        "userId": "u_3",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_297",
        "userId": "u_5",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_298",
        "userId": "u_5",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_299",
        "userId": "u_5",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_300",
        "userId": "u_5",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_301",
        "userId": "u_6",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_302",
        "userId": "u_6",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_303",
        "userId": "u_6",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_304",
        "userId": "u_6",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_305",
        "userId": "u_7",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_306",
        "userId": "u_7",
        "date": "2026-02-07",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_307",
        "userId": "u_7",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_308",
        "userId": "u_8",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_309",
        "userId": "u_8",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_310",
        "userId": "u_8",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_311",
        "userId": "u_10",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_312",
        "userId": "u_10",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_313",
        "userId": "u_10",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_314",
        "userId": "u_10",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_315",
        "userId": "u_11",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_316",
        "userId": "u_11",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_317",
        "userId": "u_11",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_318",
        "userId": "u_12",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_319",
        "userId": "u_12",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_320",
        "userId": "u_12",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_321",
        "userId": "u_12",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_322",
        "userId": "u_13",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_323",
        "userId": "u_13",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_324",
        "userId": "u_13",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_325",
        "userId": "u_13",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_326",
        "userId": "u_13",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_327",
        "userId": "u_14",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_328",
        "userId": "u_15",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_329",
        "userId": "u_15",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_330",
        "userId": "u_16",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_331",
        "userId": "u_16",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_332",
        "userId": "u_16",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_333",
        "userId": "u_16",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_334",
        "userId": "u_17",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_335",
        "userId": "u_17",
        "date": "2026-02-07",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_336",
        "userId": "u_17",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_337",
        "userId": "u_17",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_338",
        "userId": "u_17",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_339",
        "userId": "u_19",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_340",
        "userId": "u_19",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_341",
        "userId": "u_19",
        "date": "2026-02-07",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_342",
        "userId": "u_19",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_343",
        "userId": "u_19",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_344",
        "userId": "u_20",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_345",
        "userId": "u_20",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_346",
        "userId": "u_21",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_347",
        "userId": "u_21",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_348",
        "userId": "u_21",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_349",
        "userId": "u_25",
        "date": "2026-02-07",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_350",
        "userId": "u_25",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_351",
        "userId": "u_25",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_352",
        "userId": "u_25",
        "date": "2026-02-07",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_353",
        "userId": "u_26",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_354",
        "userId": "u_26",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_355",
        "userId": "u_26",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_356",
        "userId": "u_27",
        "date": "2026-02-07",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_357",
        "userId": "u_27",
        "date": "2026-02-07",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_358",
        "userId": "u_27",
        "date": "2026-02-07",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_359",
        "userId": "u_28",
        "date": "2026-02-07",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_360",
        "userId": "u_sandeep",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_361",
        "userId": "u_sandeep",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_362",
        "userId": "u_sandeep",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_363",
        "userId": "u_sandeep",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_364",
        "userId": "u_sandeep",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_365",
        "userId": "u_1",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_366",
        "userId": "u_1",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_367",
        "userId": "u_1",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_368",
        "userId": "u_3",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_369",
        "userId": "u_3",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_370",
        "userId": "u_3",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_371",
        "userId": "u_3",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_372",
        "userId": "u_3",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_373",
        "userId": "u_5",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_374",
        "userId": "u_5",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_375",
        "userId": "u_5",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_376",
        "userId": "u_5",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_377",
        "userId": "u_6",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_378",
        "userId": "u_6",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_379",
        "userId": "u_6",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 35,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_380",
        "userId": "u_6",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_381",
        "userId": "u_6",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_382",
        "userId": "u_7",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_383",
        "userId": "u_8",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_384",
        "userId": "u_8",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_385",
        "userId": "u_10",
        "date": "2026-02-08",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_386",
        "userId": "u_10",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_387",
        "userId": "u_10",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_388",
        "userId": "u_10",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_389",
        "userId": "u_11",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_390",
        "userId": "u_14",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_391",
        "userId": "u_14",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_392",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_393",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_394",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_395",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_396",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_397",
        "userId": "u_15",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_398",
        "userId": "u_16",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_399",
        "userId": "u_16",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_400",
        "userId": "u_16",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_401",
        "userId": "u_16",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_402",
        "userId": "u_17",
        "date": "2026-02-08",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_403",
        "userId": "u_17",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_404",
        "userId": "u_17",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_405",
        "userId": "u_19",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_406",
        "userId": "u_19",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_407",
        "userId": "u_19",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_408",
        "userId": "u_19",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_409",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_410",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_411",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_412",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_413",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_414",
        "userId": "u_20",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_415",
        "userId": "u_21",
        "date": "2026-02-08",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_416",
        "userId": "u_21",
        "date": "2026-02-08",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_417",
        "userId": "u_21",
        "date": "2026-02-08",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_418",
        "userId": "u_21",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_419",
        "userId": "u_23",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_420",
        "userId": "u_23",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_421",
        "userId": "u_23",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_422",
        "userId": "u_25",
        "date": "2026-02-08",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_423",
        "userId": "u_25",
        "date": "2026-02-08",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_424",
        "userId": "u_25",
        "date": "2026-02-08",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_425",
        "userId": "u_25",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_426",
        "userId": "u_26",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_427",
        "userId": "u_26",
        "date": "2026-02-08",
        "category": "Sports",
        "points": 40,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_428",
        "userId": "u_26",
        "date": "2026-02-08",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_429",
        "userId": "u_26",
        "date": "2026-02-08",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_430",
        "userId": "u_27",
        "date": "2026-02-08",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_431",
        "userId": "u_sandeep",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_432",
        "userId": "u_sandeep",
        "date": "2026-02-09",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_433",
        "userId": "u_sandeep",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_434",
        "userId": "u_1",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_435",
        "userId": "u_1",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_436",
        "userId": "u_2",
        "date": "2026-02-09",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_437",
        "userId": "u_2",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_438",
        "userId": "u_2",
        "date": "2026-02-09",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_439",
        "userId": "u_5",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_440",
        "userId": "u_5",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_441",
        "userId": "u_5",
        "date": "2026-02-09",
        "category": "Power",
        "points": 50,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_442",
        "userId": "u_6",
        "date": "2026-02-09",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_443",
        "userId": "u_6",
        "date": "2026-02-09",
        "category": "Power",
        "points": 40,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_444",
        "userId": "u_7",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_445",
        "userId": "u_7",
        "date": "2026-02-09",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_446",
        "userId": "u_7",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_447",
        "userId": "u_9",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_448",
        "userId": "u_9",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_449",
        "userId": "u_10",
        "date": "2026-02-09",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_450",
        "userId": "u_15",
        "date": "2026-02-09",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_451",
        "userId": "u_15",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_452",
        "userId": "u_15",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_453",
        "userId": "u_16",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_454",
        "userId": "u_16",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_455",
        "userId": "u_17",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_456",
        "userId": "u_17",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_457",
        "userId": "u_17",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_458",
        "userId": "u_18",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_459",
        "userId": "u_18",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_460",
        "userId": "u_18",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_461",
        "userId": "u_19",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_462",
        "userId": "u_20",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_463",
        "userId": "u_20",
        "date": "2026-02-09",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_464",
        "userId": "u_20",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_465",
        "userId": "u_21",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_466",
        "userId": "u_22",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_467",
        "userId": "u_22",
        "date": "2026-02-09",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_468",
        "userId": "u_22",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_469",
        "userId": "u_22",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_470",
        "userId": "u_23",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_471",
        "userId": "u_23",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_472",
        "userId": "u_25",
        "date": "2026-02-09",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_473",
        "userId": "u_25",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_474",
        "userId": "u_25",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_475",
        "userId": "u_26",
        "date": "2026-02-09",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_476",
        "userId": "u_26",
        "date": "2026-02-09",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_477",
        "userId": "u_27",
        "date": "2026-02-09",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_478",
        "userId": "u_27",
        "date": "2026-02-09",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_479",
        "userId": "u_sandeep",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_480",
        "userId": "u_sandeep",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_481",
        "userId": "u_2",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_482",
        "userId": "u_2",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_483",
        "userId": "u_2",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_484",
        "userId": "u_4",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_485",
        "userId": "u_4",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_486",
        "userId": "u_4",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_487",
        "userId": "u_4",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_488",
        "userId": "u_4",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_489",
        "userId": "u_5",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_490",
        "userId": "u_5",
        "date": "2026-02-10",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_491",
        "userId": "u_6",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_492",
        "userId": "u_6",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 40,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_493",
        "userId": "u_7",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_494",
        "userId": "u_8",
        "date": "2026-02-10",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_495",
        "userId": "u_9",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_496",
        "userId": "u_9",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_497",
        "userId": "u_9",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_498",
        "userId": "u_10",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_499",
        "userId": "u_10",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 40,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_500",
        "userId": "u_13",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_501",
        "userId": "u_13",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_502",
        "userId": "u_13",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_503",
        "userId": "u_15",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_504",
        "userId": "u_15",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_505",
        "userId": "u_15",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_506",
        "userId": "u_16",
        "date": "2026-02-10",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_507",
        "userId": "u_16",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_508",
        "userId": "u_16",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_509",
        "userId": "u_17",
        "date": "2026-02-10",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_510",
        "userId": "u_17",
        "date": "2026-02-10",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_511",
        "userId": "u_17",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_512",
        "userId": "u_17",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_513",
        "userId": "u_18",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_514",
        "userId": "u_19",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_515",
        "userId": "u_19",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_516",
        "userId": "u_19",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_517",
        "userId": "u_20",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_518",
        "userId": "u_20",
        "date": "2026-02-10",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_519",
        "userId": "u_23",
        "date": "2026-02-10",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_520",
        "userId": "u_23",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_521",
        "userId": "u_25",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_522",
        "userId": "u_25",
        "date": "2026-02-10",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_523",
        "userId": "u_25",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 55,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_524",
        "userId": "u_26",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_525",
        "userId": "u_27",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_526",
        "userId": "u_27",
        "date": "2026-02-10",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_527",
        "userId": "u_27",
        "date": "2026-02-10",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_528",
        "userId": "u_29",
        "date": "2026-02-10",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_529",
        "userId": "u_sandeep",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_530",
        "userId": "u_sandeep",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_531",
        "userId": "u_sandeep",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_532",
        "userId": "u_sandeep",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_533",
        "userId": "u_1",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_534",
        "userId": "u_1",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_535",
        "userId": "u_2",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_536",
        "userId": "u_2",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_537",
        "userId": "u_2",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_538",
        "userId": "u_4",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_539",
        "userId": "u_4",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_540",
        "userId": "u_4",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_541",
        "userId": "u_4",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_542",
        "userId": "u_5",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_543",
        "userId": "u_5",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_544",
        "userId": "u_5",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_545",
        "userId": "u_6",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_546",
        "userId": "u_6",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_547",
        "userId": "u_6",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_548",
        "userId": "u_7",
        "date": "2026-02-11",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_549",
        "userId": "u_10",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_550",
        "userId": "u_10",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_551",
        "userId": "u_10",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 50,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_552",
        "userId": "u_11",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_553",
        "userId": "u_11",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_554",
        "userId": "u_11",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_555",
        "userId": "u_11",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_556",
        "userId": "u_15",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_557",
        "userId": "u_15",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_558",
        "userId": "u_15",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_559",
        "userId": "u_16",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_560",
        "userId": "u_17",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_561",
        "userId": "u_17",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_562",
        "userId": "u_17",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_563",
        "userId": "u_17",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_564",
        "userId": "u_17",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_565",
        "userId": "u_20",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_566",
        "userId": "u_20",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_567",
        "userId": "u_21",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_568",
        "userId": "u_21",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_569",
        "userId": "u_22",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_570",
        "userId": "u_22",
        "date": "2026-02-11",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_571",
        "userId": "u_23",
        "date": "2026-02-11",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_572",
        "userId": "u_23",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_573",
        "userId": "u_23",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_574",
        "userId": "u_24",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_575",
        "userId": "u_24",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_576",
        "userId": "u_25",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_577",
        "userId": "u_25",
        "date": "2026-02-11",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_578",
        "userId": "u_25",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_579",
        "userId": "u_25",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_580",
        "userId": "u_25",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_581",
        "userId": "u_26",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_582",
        "userId": "u_26",
        "date": "2026-02-11",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_583",
        "userId": "u_27",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_584",
        "userId": "u_27",
        "date": "2026-02-11",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_585",
        "userId": "u_27",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_586",
        "userId": "u_28",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_587",
        "userId": "u_28",
        "date": "2026-02-11",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_588",
        "userId": "u_28",
        "date": "2026-02-11",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_589",
        "userId": "u_29",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_590",
        "userId": "u_29",
        "date": "2026-02-11",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_591",
        "userId": "u_29",
        "date": "2026-02-11",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_592",
        "userId": "u_sandeep",
        "date": "2026-02-12",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_593",
        "userId": "u_sandeep",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_594",
        "userId": "u_sandeep",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_595",
        "userId": "u_1",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_596",
        "userId": "u_1",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_597",
        "userId": "u_1",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_598",
        "userId": "u_3",
        "date": "2026-02-12",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_599",
        "userId": "u_5",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_600",
        "userId": "u_5",
        "date": "2026-02-12",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_601",
        "userId": "u_5",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_602",
        "userId": "u_5",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_603",
        "userId": "u_6",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_604",
        "userId": "u_6",
        "date": "2026-02-12",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_605",
        "userId": "u_6",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_606",
        "userId": "u_6",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_607",
        "userId": "u_7",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_608",
        "userId": "u_7",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_609",
        "userId": "u_7",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_610",
        "userId": "u_7",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_611",
        "userId": "u_8",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_612",
        "userId": "u_10",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_613",
        "userId": "u_10",
        "date": "2026-02-12",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_614",
        "userId": "u_11",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_615",
        "userId": "u_14",
        "date": "2026-02-12",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_616",
        "userId": "u_15",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_617",
        "userId": "u_15",
        "date": "2026-02-12",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_618",
        "userId": "u_15",
        "date": "2026-02-12",
        "category": "Power",
        "points": 10,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_619",
        "userId": "u_16",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_620",
        "userId": "u_17",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_621",
        "userId": "u_17",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_622",
        "userId": "u_17",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_623",
        "userId": "u_18",
        "date": "2026-02-12",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_624",
        "userId": "u_18",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_625",
        "userId": "u_18",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_626",
        "userId": "u_18",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_627",
        "userId": "u_19",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_628",
        "userId": "u_19",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_629",
        "userId": "u_19",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_630",
        "userId": "u_20",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_631",
        "userId": "u_20",
        "date": "2026-02-12",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_632",
        "userId": "u_20",
        "date": "2026-02-12",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_633",
        "userId": "u_21",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_634",
        "userId": "u_21",
        "date": "2026-02-12",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_635",
        "userId": "u_21",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_636",
        "userId": "u_23",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_637",
        "userId": "u_23",
        "date": "2026-02-12",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_638",
        "userId": "u_26",
        "date": "2026-02-12",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_639",
        "userId": "u_26",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_640",
        "userId": "u_27",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_641",
        "userId": "u_27",
        "date": "2026-02-12",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_642",
        "userId": "u_27",
        "date": "2026-02-12",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_643",
        "userId": "u_sandeep",
        "date": "2026-02-13",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_644",
        "userId": "u_sandeep",
        "date": "2026-02-13",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_645",
        "userId": "u_sandeep",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_646",
        "userId": "u_sandeep",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_647",
        "userId": "u_1",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_648",
        "userId": "u_1",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_649",
        "userId": "u_1",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_650",
        "userId": "u_1",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_651",
        "userId": "u_2",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_652",
        "userId": "u_2",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_653",
        "userId": "u_2",
        "date": "2026-02-13",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_654",
        "userId": "u_3",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_655",
        "userId": "u_3",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_656",
        "userId": "u_5",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_657",
        "userId": "u_5",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_658",
        "userId": "u_5",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_659",
        "userId": "u_6",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_660",
        "userId": "u_6",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_661",
        "userId": "u_6",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_662",
        "userId": "u_6",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_663",
        "userId": "u_7",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_664",
        "userId": "u_7",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_665",
        "userId": "u_8",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_666",
        "userId": "u_10",
        "date": "2026-02-13",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_667",
        "userId": "u_10",
        "date": "2026-02-13",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_668",
        "userId": "u_10",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_669",
        "userId": "u_11",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_670",
        "userId": "u_11",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_671",
        "userId": "u_11",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_672",
        "userId": "u_11",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_673",
        "userId": "u_13",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_674",
        "userId": "u_13",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_675",
        "userId": "u_13",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_676",
        "userId": "u_15",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_677",
        "userId": "u_15",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_678",
        "userId": "u_15",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_679",
        "userId": "u_15",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_680",
        "userId": "u_15",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_681",
        "userId": "u_16",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_682",
        "userId": "u_16",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_683",
        "userId": "u_16",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_684",
        "userId": "u_17",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_685",
        "userId": "u_18",
        "date": "2026-02-13",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_686",
        "userId": "u_18",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_687",
        "userId": "u_18",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_688",
        "userId": "u_18",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_689",
        "userId": "u_20",
        "date": "2026-02-13",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_690",
        "userId": "u_20",
        "date": "2026-02-13",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_691",
        "userId": "u_21",
        "date": "2026-02-13",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_692",
        "userId": "u_21",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_693",
        "userId": "u_21",
        "date": "2026-02-13",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_694",
        "userId": "u_23",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_695",
        "userId": "u_24",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_696",
        "userId": "u_24",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_697",
        "userId": "u_25",
        "date": "2026-02-13",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_698",
        "userId": "u_25",
        "date": "2026-02-13",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_699",
        "userId": "u_26",
        "date": "2026-02-13",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_700",
        "userId": "u_26",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_701",
        "userId": "u_26",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_702",
        "userId": "u_27",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_703",
        "userId": "u_27",
        "date": "2026-02-13",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_704",
        "userId": "u_sandeep",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_705",
        "userId": "u_3",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_706",
        "userId": "u_3",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_707",
        "userId": "u_3",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_708",
        "userId": "u_3",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_709",
        "userId": "u_5",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_710",
        "userId": "u_5",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_711",
        "userId": "u_5",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_712",
        "userId": "u_5",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_713",
        "userId": "u_5",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_714",
        "userId": "u_6",
        "date": "2026-02-14",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_715",
        "userId": "u_6",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_716",
        "userId": "u_6",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_717",
        "userId": "u_6",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_718",
        "userId": "u_7",
        "date": "2026-02-14",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_719",
        "userId": "u_7",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_720",
        "userId": "u_7",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_721",
        "userId": "u_7",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_722",
        "userId": "u_7",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_723",
        "userId": "u_8",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_724",
        "userId": "u_8",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_725",
        "userId": "u_8",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_726",
        "userId": "u_9",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_727",
        "userId": "u_10",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_728",
        "userId": "u_10",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_729",
        "userId": "u_11",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_730",
        "userId": "u_11",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_731",
        "userId": "u_11",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_732",
        "userId": "u_11",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_733",
        "userId": "u_12",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_734",
        "userId": "u_12",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_735",
        "userId": "u_14",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_736",
        "userId": "u_16",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_737",
        "userId": "u_16",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_738",
        "userId": "u_16",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_739",
        "userId": "u_16",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_740",
        "userId": "u_17",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_741",
        "userId": "u_17",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_742",
        "userId": "u_17",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 25,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_743",
        "userId": "u_17",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_744",
        "userId": "u_17",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_745",
        "userId": "u_19",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_746",
        "userId": "u_19",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_747",
        "userId": "u_20",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_748",
        "userId": "u_20",
        "date": "2026-02-14",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_749",
        "userId": "u_20",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_750",
        "userId": "u_21",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_751",
        "userId": "u_21",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_752",
        "userId": "u_21",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_753",
        "userId": "u_22",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_754",
        "userId": "u_22",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_755",
        "userId": "u_22",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_756",
        "userId": "u_22",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_757",
        "userId": "u_23",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_758",
        "userId": "u_23",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_759",
        "userId": "u_23",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_760",
        "userId": "u_25",
        "date": "2026-02-14",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_761",
        "userId": "u_25",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_762",
        "userId": "u_25",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_763",
        "userId": "u_25",
        "date": "2026-02-14",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_764",
        "userId": "u_26",
        "date": "2026-02-14",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_765",
        "userId": "u_26",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_766",
        "userId": "u_26",
        "date": "2026-02-14",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_767",
        "userId": "u_27",
        "date": "2026-02-14",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_768",
        "userId": "u_27",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_769",
        "userId": "u_28",
        "date": "2026-02-14",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_770",
        "userId": "u_28",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_771",
        "userId": "u_28",
        "date": "2026-02-14",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_772",
        "userId": "u_29",
        "date": "2026-02-14",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_773",
        "userId": "u_sandeep",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_774",
        "userId": "u_sandeep",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_775",
        "userId": "u_sandeep",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_776",
        "userId": "u_sandeep",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_777",
        "userId": "u_1",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_778",
        "userId": "u_1",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_779",
        "userId": "u_1",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_780",
        "userId": "u_1",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_781",
        "userId": "u_3",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_782",
        "userId": "u_3",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_783",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_784",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_785",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_786",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_787",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_788",
        "userId": "u_6",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_789",
        "userId": "u_7",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_790",
        "userId": "u_7",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_791",
        "userId": "u_7",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_792",
        "userId": "u_7",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_793",
        "userId": "u_8",
        "date": "2026-02-15",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_794",
        "userId": "u_8",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_795",
        "userId": "u_8",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_796",
        "userId": "u_8",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_797",
        "userId": "u_10",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_798",
        "userId": "u_10",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_799",
        "userId": "u_10",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_800",
        "userId": "u_10",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_801",
        "userId": "u_13",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_802",
        "userId": "u_13",
        "date": "2026-02-15",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_803",
        "userId": "u_13",
        "date": "2026-02-15",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_804",
        "userId": "u_13",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_805",
        "userId": "u_15",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_806",
        "userId": "u_15",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_807",
        "userId": "u_15",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_808",
        "userId": "u_15",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_809",
        "userId": "u_16",
        "date": "2026-02-15",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_810",
        "userId": "u_16",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_811",
        "userId": "u_16",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_812",
        "userId": "u_16",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_813",
        "userId": "u_17",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_814",
        "userId": "u_17",
        "date": "2026-02-15",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_815",
        "userId": "u_17",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_816",
        "userId": "u_17",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_817",
        "userId": "u_20",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_818",
        "userId": "u_20",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_819",
        "userId": "u_20",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_820",
        "userId": "u_20",
        "date": "2026-02-15",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_821",
        "userId": "u_25",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_822",
        "userId": "u_25",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_823",
        "userId": "u_25",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_824",
        "userId": "u_25",
        "date": "2026-02-15",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_825",
        "userId": "u_25",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_826",
        "userId": "u_26",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_827",
        "userId": "u_27",
        "date": "2026-02-15",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_828",
        "userId": "u_27",
        "date": "2026-02-15",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_829",
        "userId": "u_28",
        "date": "2026-02-15",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_830",
        "userId": "u_28",
        "date": "2026-02-15",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_831",
        "userId": "u_sandeep",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_832",
        "userId": "u_sandeep",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_833",
        "userId": "u_sandeep",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_834",
        "userId": "u_1",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_835",
        "userId": "u_1",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_836",
        "userId": "u_2",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_837",
        "userId": "u_2",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_838",
        "userId": "u_2",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_839",
        "userId": "u_2",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_840",
        "userId": "u_2",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_841",
        "userId": "u_3",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_842",
        "userId": "u_3",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_843",
        "userId": "u_3",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_844",
        "userId": "u_4",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_845",
        "userId": "u_4",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_846",
        "userId": "u_4",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_847",
        "userId": "u_5",
        "date": "2026-02-16",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_848",
        "userId": "u_5",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_849",
        "userId": "u_5",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_850",
        "userId": "u_6",
        "date": "2026-02-16",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_851",
        "userId": "u_6",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_852",
        "userId": "u_7",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_853",
        "userId": "u_7",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_854",
        "userId": "u_7",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_855",
        "userId": "u_8",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_856",
        "userId": "u_8",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_857",
        "userId": "u_10",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_858",
        "userId": "u_10",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_859",
        "userId": "u_10",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_860",
        "userId": "u_11",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_861",
        "userId": "u_11",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_862",
        "userId": "u_11",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_863",
        "userId": "u_11",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_864",
        "userId": "u_13",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_865",
        "userId": "u_13",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_866",
        "userId": "u_13",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_867",
        "userId": "u_15",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_868",
        "userId": "u_15",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_869",
        "userId": "u_16",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_870",
        "userId": "u_16",
        "date": "2026-02-16",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_871",
        "userId": "u_16",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_872",
        "userId": "u_17",
        "date": "2026-02-16",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_873",
        "userId": "u_17",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_874",
        "userId": "u_17",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_875",
        "userId": "u_19",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_876",
        "userId": "u_19",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_877",
        "userId": "u_20",
        "date": "2026-02-16",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_878",
        "userId": "u_20",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_879",
        "userId": "u_20",
        "date": "2026-02-16",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_880",
        "userId": "u_22",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_881",
        "userId": "u_22",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_882",
        "userId": "u_22",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_883",
        "userId": "u_22",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_884",
        "userId": "u_22",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_885",
        "userId": "u_23",
        "date": "2026-02-16",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_886",
        "userId": "u_23",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_887",
        "userId": "u_23",
        "date": "2026-02-16",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_888",
        "userId": "u_25",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_889",
        "userId": "u_25",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_890",
        "userId": "u_25",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_891",
        "userId": "u_26",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_892",
        "userId": "u_26",
        "date": "2026-02-16",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_893",
        "userId": "u_26",
        "date": "2026-02-16",
        "category": "Power",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_894",
        "userId": "u_27",
        "date": "2026-02-16",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_895",
        "userId": "u_27",
        "date": "2026-02-16",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_896",
        "userId": "u_sandeep",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_897",
        "userId": "u_sandeep",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_898",
        "userId": "u_sandeep",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_899",
        "userId": "u_3",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_900",
        "userId": "u_3",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_901",
        "userId": "u_3",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_902",
        "userId": "u_5",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_903",
        "userId": "u_5",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_904",
        "userId": "u_5",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_905",
        "userId": "u_6",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_906",
        "userId": "u_7",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_907",
        "userId": "u_7",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_908",
        "userId": "u_7",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_909",
        "userId": "u_10",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_910",
        "userId": "u_10",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_911",
        "userId": "u_10",
        "date": "2026-02-17",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_912",
        "userId": "u_10",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_913",
        "userId": "u_11",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_914",
        "userId": "u_11",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_915",
        "userId": "u_11",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_916",
        "userId": "u_15",
        "date": "2026-02-17",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_917",
        "userId": "u_15",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_918",
        "userId": "u_15",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_919",
        "userId": "u_16",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_920",
        "userId": "u_16",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_921",
        "userId": "u_16",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_922",
        "userId": "u_17",
        "date": "2026-02-17",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_923",
        "userId": "u_17",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_924",
        "userId": "u_17",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_925",
        "userId": "u_20",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_926",
        "userId": "u_20",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_927",
        "userId": "u_21",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_928",
        "userId": "u_21",
        "date": "2026-02-17",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_929",
        "userId": "u_21",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_930",
        "userId": "u_22",
        "date": "2026-02-17",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_931",
        "userId": "u_22",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_932",
        "userId": "u_22",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_933",
        "userId": "u_24",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_934",
        "userId": "u_24",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_935",
        "userId": "u_24",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_936",
        "userId": "u_25",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_937",
        "userId": "u_25",
        "date": "2026-02-17",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_938",
        "userId": "u_26",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_939",
        "userId": "u_26",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_940",
        "userId": "u_26",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_941",
        "userId": "u_26",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_942",
        "userId": "u_27",
        "date": "2026-02-17",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_943",
        "userId": "u_28",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_944",
        "userId": "u_28",
        "date": "2026-02-17",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_945",
        "userId": "u_28",
        "date": "2026-02-17",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_946",
        "userId": "u_28",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_947",
        "userId": "u_28",
        "date": "2026-02-17",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_948",
        "userId": "u_29",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_949",
        "userId": "u_29",
        "date": "2026-02-17",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_950",
        "userId": "u_29",
        "date": "2026-02-17",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_951",
        "userId": "u_sandeep",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_952",
        "userId": "u_sandeep",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_953",
        "userId": "u_sandeep",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_954",
        "userId": "u_1",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_955",
        "userId": "u_1",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_956",
        "userId": "u_1",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_957",
        "userId": "u_3",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_958",
        "userId": "u_3",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_959",
        "userId": "u_5",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_960",
        "userId": "u_5",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_961",
        "userId": "u_6",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_962",
        "userId": "u_6",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_963",
        "userId": "u_7",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_964",
        "userId": "u_7",
        "date": "2026-02-18",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_965",
        "userId": "u_8",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_966",
        "userId": "u_8",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_967",
        "userId": "u_8",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_968",
        "userId": "u_11",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_969",
        "userId": "u_11",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_970",
        "userId": "u_11",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_971",
        "userId": "u_13",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_972",
        "userId": "u_13",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_973",
        "userId": "u_13",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_974",
        "userId": "u_13",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_975",
        "userId": "u_13",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_976",
        "userId": "u_14",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_977",
        "userId": "u_14",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_978",
        "userId": "u_15",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_979",
        "userId": "u_15",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_980",
        "userId": "u_15",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_981",
        "userId": "u_15",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_982",
        "userId": "u_16",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_983",
        "userId": "u_16",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_984",
        "userId": "u_16",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_985",
        "userId": "u_16",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_986",
        "userId": "u_16",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_987",
        "userId": "u_17",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_988",
        "userId": "u_17",
        "date": "2026-02-18",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_989",
        "userId": "u_17",
        "date": "2026-02-18",
        "category": "Power",
        "points": 10,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_990",
        "userId": "u_18",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_991",
        "userId": "u_20",
        "date": "2026-02-18",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_992",
        "userId": "u_20",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_993",
        "userId": "u_20",
        "date": "2026-02-18",
        "category": "Power",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_994",
        "userId": "u_21",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_995",
        "userId": "u_21",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_996",
        "userId": "u_21",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_997",
        "userId": "u_21",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_998",
        "userId": "u_22",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_999",
        "userId": "u_22",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1000",
        "userId": "u_22",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1001",
        "userId": "u_24",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1002",
        "userId": "u_24",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1003",
        "userId": "u_24",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1004",
        "userId": "u_25",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1005",
        "userId": "u_25",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1006",
        "userId": "u_26",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1007",
        "userId": "u_26",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1008",
        "userId": "u_26",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1009",
        "userId": "u_27",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1010",
        "userId": "u_27",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1011",
        "userId": "u_27",
        "date": "2026-02-18",
        "category": "Sports",
        "points": 50,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1012",
        "userId": "u_28",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1013",
        "userId": "u_28",
        "date": "2026-02-18",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1014",
        "userId": "u_28",
        "date": "2026-02-18",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1015",
        "userId": "u_29",
        "date": "2026-02-18",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1016",
        "userId": "u_29",
        "date": "2026-02-18",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1017",
        "userId": "u_29",
        "date": "2026-02-18",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1018",
        "userId": "u_sandeep",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1019",
        "userId": "u_sandeep",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1020",
        "userId": "u_1",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1021",
        "userId": "u_1",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1022",
        "userId": "u_2",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1023",
        "userId": "u_2",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1024",
        "userId": "u_2",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1025",
        "userId": "u_2",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1026",
        "userId": "u_5",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1027",
        "userId": "u_5",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1028",
        "userId": "u_5",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1029",
        "userId": "u_5",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1030",
        "userId": "u_6",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1031",
        "userId": "u_6",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1032",
        "userId": "u_6",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1033",
        "userId": "u_7",
        "date": "2026-02-19",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1034",
        "userId": "u_7",
        "date": "2026-02-19",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1035",
        "userId": "u_8",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1036",
        "userId": "u_8",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1037",
        "userId": "u_10",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1038",
        "userId": "u_10",
        "date": "2026-02-19",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1039",
        "userId": "u_10",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1040",
        "userId": "u_10",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1041",
        "userId": "u_11",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1042",
        "userId": "u_11",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1043",
        "userId": "u_12",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1044",
        "userId": "u_12",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1045",
        "userId": "u_12",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1046",
        "userId": "u_12",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1047",
        "userId": "u_15",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1048",
        "userId": "u_15",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1049",
        "userId": "u_15",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1050",
        "userId": "u_15",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1051",
        "userId": "u_16",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1052",
        "userId": "u_16",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1053",
        "userId": "u_17",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1054",
        "userId": "u_17",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1055",
        "userId": "u_18",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1056",
        "userId": "u_18",
        "date": "2026-02-19",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1057",
        "userId": "u_18",
        "date": "2026-02-19",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1058",
        "userId": "u_20",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1059",
        "userId": "u_20",
        "date": "2026-02-19",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1060",
        "userId": "u_20",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 20,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1061",
        "userId": "u_21",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1062",
        "userId": "u_21",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1063",
        "userId": "u_22",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1064",
        "userId": "u_22",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1065",
        "userId": "u_23",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1066",
        "userId": "u_23",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1067",
        "userId": "u_23",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1068",
        "userId": "u_23",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1069",
        "userId": "u_25",
        "date": "2026-02-19",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1070",
        "userId": "u_25",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1071",
        "userId": "u_25",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1072",
        "userId": "u_25",
        "date": "2026-02-19",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1073",
        "userId": "u_26",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1074",
        "userId": "u_27",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1075",
        "userId": "u_27",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1076",
        "userId": "u_27",
        "date": "2026-02-19",
        "category": "Sports",
        "points": 20,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1077",
        "userId": "u_28",
        "date": "2026-02-19",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1078",
        "userId": "u_28",
        "date": "2026-02-19",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1079",
        "userId": "u_sandeep",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1080",
        "userId": "u_sandeep",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1081",
        "userId": "u_sandeep",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1082",
        "userId": "u_2",
        "date": "2026-02-20",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1083",
        "userId": "u_2",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1084",
        "userId": "u_5",
        "date": "2026-02-20",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1085",
        "userId": "u_5",
        "date": "2026-02-20",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1086",
        "userId": "u_6",
        "date": "2026-02-20",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1087",
        "userId": "u_6",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1088",
        "userId": "u_7",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1089",
        "userId": "u_7",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1090",
        "userId": "u_13",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1091",
        "userId": "u_14",
        "date": "2026-02-20",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1092",
        "userId": "u_15",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1093",
        "userId": "u_15",
        "date": "2026-02-20",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1094",
        "userId": "u_15",
        "date": "2026-02-20",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1095",
        "userId": "u_16",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1096",
        "userId": "u_16",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1097",
        "userId": "u_16",
        "date": "2026-02-20",
        "category": "Power",
        "points": 50,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1098",
        "userId": "u_17",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1099",
        "userId": "u_17",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1100",
        "userId": "u_19",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1101",
        "userId": "u_19",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1102",
        "userId": "u_19",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1103",
        "userId": "u_19",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1104",
        "userId": "u_19",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1105",
        "userId": "u_20",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1106",
        "userId": "u_20",
        "date": "2026-02-20",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1107",
        "userId": "u_21",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1108",
        "userId": "u_21",
        "date": "2026-02-20",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1109",
        "userId": "u_21",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1110",
        "userId": "u_22",
        "date": "2026-02-20",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1111",
        "userId": "u_22",
        "date": "2026-02-20",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1112",
        "userId": "u_23",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1113",
        "userId": "u_23",
        "date": "2026-02-20",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1114",
        "userId": "u_23",
        "date": "2026-02-20",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1115",
        "userId": "u_24",
        "date": "2026-02-20",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1116",
        "userId": "u_28",
        "date": "2026-02-20",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1117",
        "userId": "u_sandeep",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1118",
        "userId": "u_sandeep",
        "date": "2026-02-21",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1119",
        "userId": "u_sandeep",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1120",
        "userId": "u_1",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1121",
        "userId": "u_1",
        "date": "2026-02-21",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1122",
        "userId": "u_1",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1123",
        "userId": "u_2",
        "date": "2026-02-21",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1124",
        "userId": "u_2",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1125",
        "userId": "u_2",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1126",
        "userId": "u_4",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1127",
        "userId": "u_5",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1128",
        "userId": "u_5",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1129",
        "userId": "u_5",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1130",
        "userId": "u_6",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1131",
        "userId": "u_6",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1132",
        "userId": "u_6",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1133",
        "userId": "u_6",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1134",
        "userId": "u_6",
        "date": "2026-02-21",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1135",
        "userId": "u_7",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1136",
        "userId": "u_7",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 55,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1137",
        "userId": "u_7",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1138",
        "userId": "u_8",
        "date": "2026-02-21",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1139",
        "userId": "u_8",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1140",
        "userId": "u_11",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1141",
        "userId": "u_12",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1142",
        "userId": "u_15",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1143",
        "userId": "u_15",
        "date": "2026-02-21",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1144",
        "userId": "u_15",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1145",
        "userId": "u_15",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1146",
        "userId": "u_16",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1147",
        "userId": "u_16",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1148",
        "userId": "u_16",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1149",
        "userId": "u_17",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1150",
        "userId": "u_17",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1151",
        "userId": "u_17",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1152",
        "userId": "u_17",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1153",
        "userId": "u_17",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1154",
        "userId": "u_18",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1155",
        "userId": "u_18",
        "date": "2026-02-21",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1156",
        "userId": "u_20",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1157",
        "userId": "u_20",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1158",
        "userId": "u_20",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1159",
        "userId": "u_20",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1160",
        "userId": "u_21",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1161",
        "userId": "u_21",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1162",
        "userId": "u_23",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1163",
        "userId": "u_23",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1164",
        "userId": "u_23",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1165",
        "userId": "u_23",
        "date": "2026-02-21",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1166",
        "userId": "u_25",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1167",
        "userId": "u_25",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1168",
        "userId": "u_25",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1169",
        "userId": "u_25",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1170",
        "userId": "u_25",
        "date": "2026-02-21",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1171",
        "userId": "u_26",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1172",
        "userId": "u_26",
        "date": "2026-02-21",
        "category": "Power",
        "points": 55,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1173",
        "userId": "u_26",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1174",
        "userId": "u_27",
        "date": "2026-02-21",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1175",
        "userId": "u_27",
        "date": "2026-02-21",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1176",
        "userId": "u_27",
        "date": "2026-02-21",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1177",
        "userId": "u_29",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1178",
        "userId": "u_29",
        "date": "2026-02-21",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1179",
        "userId": "u_29",
        "date": "2026-02-21",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1180",
        "userId": "u_sandeep",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1181",
        "userId": "u_sandeep",
        "date": "2026-02-22",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1182",
        "userId": "u_1",
        "date": "2026-02-22",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1183",
        "userId": "u_1",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1184",
        "userId": "u_1",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1185",
        "userId": "u_1",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1186",
        "userId": "u_1",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1187",
        "userId": "u_5",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1188",
        "userId": "u_5",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1189",
        "userId": "u_6",
        "date": "2026-02-22",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1190",
        "userId": "u_6",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1191",
        "userId": "u_7",
        "date": "2026-02-22",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1192",
        "userId": "u_7",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1193",
        "userId": "u_7",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1194",
        "userId": "u_8",
        "date": "2026-02-22",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1195",
        "userId": "u_8",
        "date": "2026-02-22",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1196",
        "userId": "u_8",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1197",
        "userId": "u_10",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1198",
        "userId": "u_10",
        "date": "2026-02-22",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1199",
        "userId": "u_10",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1200",
        "userId": "u_10",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1201",
        "userId": "u_11",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1202",
        "userId": "u_11",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1203",
        "userId": "u_14",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1204",
        "userId": "u_14",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1205",
        "userId": "u_14",
        "date": "2026-02-22",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1206",
        "userId": "u_15",
        "date": "2026-02-22",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1207",
        "userId": "u_15",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1208",
        "userId": "u_15",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1209",
        "userId": "u_15",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1210",
        "userId": "u_16",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1211",
        "userId": "u_16",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1212",
        "userId": "u_16",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1213",
        "userId": "u_16",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1214",
        "userId": "u_16",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1215",
        "userId": "u_17",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1216",
        "userId": "u_17",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1217",
        "userId": "u_18",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1218",
        "userId": "u_18",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1219",
        "userId": "u_19",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1220",
        "userId": "u_19",
        "date": "2026-02-22",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1221",
        "userId": "u_19",
        "date": "2026-02-22",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1222",
        "userId": "u_20",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1223",
        "userId": "u_20",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1224",
        "userId": "u_20",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1225",
        "userId": "u_20",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1226",
        "userId": "u_21",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1227",
        "userId": "u_21",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1228",
        "userId": "u_21",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1229",
        "userId": "u_21",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1230",
        "userId": "u_25",
        "date": "2026-02-22",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1231",
        "userId": "u_25",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1232",
        "userId": "u_25",
        "date": "2026-02-22",
        "category": "Power",
        "points": 35,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1233",
        "userId": "u_25",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1234",
        "userId": "u_25",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1235",
        "userId": "u_26",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1236",
        "userId": "u_26",
        "date": "2026-02-22",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1237",
        "userId": "u_26",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1238",
        "userId": "u_27",
        "date": "2026-02-22",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1239",
        "userId": "u_27",
        "date": "2026-02-22",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1240",
        "userId": "u_27",
        "date": "2026-02-22",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1241",
        "userId": "u_28",
        "date": "2026-02-22",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1242",
        "userId": "u_28",
        "date": "2026-02-22",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1243",
        "userId": "u_sandeep",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1244",
        "userId": "u_sandeep",
        "date": "2026-02-23",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1245",
        "userId": "u_sandeep",
        "date": "2026-02-23",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1246",
        "userId": "u_3",
        "date": "2026-02-23",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1247",
        "userId": "u_5",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1248",
        "userId": "u_5",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1249",
        "userId": "u_5",
        "date": "2026-02-23",
        "category": "Power",
        "points": 50,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1250",
        "userId": "u_6",
        "date": "2026-02-23",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1251",
        "userId": "u_6",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1252",
        "userId": "u_6",
        "date": "2026-02-23",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1253",
        "userId": "u_6",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1254",
        "userId": "u_7",
        "date": "2026-02-23",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1255",
        "userId": "u_7",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1256",
        "userId": "u_7",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1257",
        "userId": "u_8",
        "date": "2026-02-23",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1258",
        "userId": "u_8",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1259",
        "userId": "u_10",
        "date": "2026-02-23",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1260",
        "userId": "u_11",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1261",
        "userId": "u_11",
        "date": "2026-02-23",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1262",
        "userId": "u_15",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1263",
        "userId": "u_15",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1264",
        "userId": "u_16",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1265",
        "userId": "u_16",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1266",
        "userId": "u_16",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1267",
        "userId": "u_17",
        "date": "2026-02-23",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1268",
        "userId": "u_17",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 40,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1269",
        "userId": "u_20",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1270",
        "userId": "u_20",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1271",
        "userId": "u_20",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1272",
        "userId": "u_21",
        "date": "2026-02-23",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1273",
        "userId": "u_21",
        "date": "2026-02-23",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1274",
        "userId": "u_21",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1275",
        "userId": "u_22",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1276",
        "userId": "u_22",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1277",
        "userId": "u_25",
        "date": "2026-02-23",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1278",
        "userId": "u_25",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1279",
        "userId": "u_25",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 10,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1280",
        "userId": "u_26",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1281",
        "userId": "u_26",
        "date": "2026-02-23",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1282",
        "userId": "u_26",
        "date": "2026-02-23",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1283",
        "userId": "u_27",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1284",
        "userId": "u_27",
        "date": "2026-02-23",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1285",
        "userId": "u_27",
        "date": "2026-02-23",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1286",
        "userId": "u_sandeep",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1287",
        "userId": "u_sandeep",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1288",
        "userId": "u_sandeep",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1289",
        "userId": "u_sandeep",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1290",
        "userId": "u_sandeep",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1291",
        "userId": "u_1",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1292",
        "userId": "u_3",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1293",
        "userId": "u_3",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1294",
        "userId": "u_3",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1295",
        "userId": "u_4",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1296",
        "userId": "u_5",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1297",
        "userId": "u_5",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1298",
        "userId": "u_6",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1299",
        "userId": "u_6",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1300",
        "userId": "u_7",
        "date": "2026-02-24",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1301",
        "userId": "u_7",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1302",
        "userId": "u_10",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1303",
        "userId": "u_10",
        "date": "2026-02-24",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1304",
        "userId": "u_10",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 15,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1305",
        "userId": "u_15",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1306",
        "userId": "u_15",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1307",
        "userId": "u_15",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1308",
        "userId": "u_16",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1309",
        "userId": "u_16",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1310",
        "userId": "u_17",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1311",
        "userId": "u_17",
        "date": "2026-02-24",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1312",
        "userId": "u_18",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1313",
        "userId": "u_18",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1314",
        "userId": "u_18",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1315",
        "userId": "u_18",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1316",
        "userId": "u_20",
        "date": "2026-02-24",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1317",
        "userId": "u_20",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1318",
        "userId": "u_20",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1319",
        "userId": "u_21",
        "date": "2026-02-24",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1320",
        "userId": "u_21",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1321",
        "userId": "u_21",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1322",
        "userId": "u_22",
        "date": "2026-02-24",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1323",
        "userId": "u_22",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1324",
        "userId": "u_22",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1325",
        "userId": "u_22",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1326",
        "userId": "u_23",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1327",
        "userId": "u_23",
        "date": "2026-02-24",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1328",
        "userId": "u_23",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1329",
        "userId": "u_24",
        "date": "2026-02-24",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1330",
        "userId": "u_25",
        "date": "2026-02-24",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1331",
        "userId": "u_25",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1332",
        "userId": "u_26",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1333",
        "userId": "u_26",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1334",
        "userId": "u_27",
        "date": "2026-02-24",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1335",
        "userId": "u_27",
        "date": "2026-02-24",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1336",
        "userId": "u_27",
        "date": "2026-02-24",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1337",
        "userId": "u_sandeep",
        "date": "2026-02-25",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1338",
        "userId": "u_sandeep",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1339",
        "userId": "u_sandeep",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1340",
        "userId": "u_sandeep",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1341",
        "userId": "u_2",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1342",
        "userId": "u_2",
        "date": "2026-02-25",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1343",
        "userId": "u_4",
        "date": "2026-02-25",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1344",
        "userId": "u_4",
        "date": "2026-02-25",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1345",
        "userId": "u_5",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1346",
        "userId": "u_7",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1347",
        "userId": "u_7",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1348",
        "userId": "u_7",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1349",
        "userId": "u_8",
        "date": "2026-02-25",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1350",
        "userId": "u_9",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1351",
        "userId": "u_9",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1352",
        "userId": "u_9",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1353",
        "userId": "u_9",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1354",
        "userId": "u_10",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1355",
        "userId": "u_10",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1356",
        "userId": "u_10",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1357",
        "userId": "u_11",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1358",
        "userId": "u_11",
        "date": "2026-02-25",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1359",
        "userId": "u_11",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1360",
        "userId": "u_13",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1361",
        "userId": "u_14",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1362",
        "userId": "u_14",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1363",
        "userId": "u_14",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1364",
        "userId": "u_15",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1365",
        "userId": "u_16",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1366",
        "userId": "u_16",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1367",
        "userId": "u_16",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1368",
        "userId": "u_17",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1369",
        "userId": "u_17",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1370",
        "userId": "u_17",
        "date": "2026-02-25",
        "category": "Power",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1371",
        "userId": "u_19",
        "date": "2026-02-25",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1372",
        "userId": "u_20",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1373",
        "userId": "u_20",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1374",
        "userId": "u_20",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1375",
        "userId": "u_20",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1376",
        "userId": "u_23",
        "date": "2026-02-25",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1377",
        "userId": "u_23",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1378",
        "userId": "u_23",
        "date": "2026-02-25",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1379",
        "userId": "u_23",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1380",
        "userId": "u_25",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1381",
        "userId": "u_25",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1382",
        "userId": "u_26",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1383",
        "userId": "u_27",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1384",
        "userId": "u_27",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1385",
        "userId": "u_27",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1386",
        "userId": "u_27",
        "date": "2026-02-25",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1387",
        "userId": "u_29",
        "date": "2026-02-25",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1388",
        "userId": "u_29",
        "date": "2026-02-25",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1389",
        "userId": "u_29",
        "date": "2026-02-25",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1390",
        "userId": "u_sandeep",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1391",
        "userId": "u_sandeep",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1392",
        "userId": "u_sandeep",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1393",
        "userId": "u_1",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1394",
        "userId": "u_1",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1395",
        "userId": "u_1",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1396",
        "userId": "u_2",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1397",
        "userId": "u_2",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1398",
        "userId": "u_2",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1399",
        "userId": "u_5",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1400",
        "userId": "u_5",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1401",
        "userId": "u_5",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1402",
        "userId": "u_5",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1403",
        "userId": "u_6",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1404",
        "userId": "u_6",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1405",
        "userId": "u_6",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1406",
        "userId": "u_7",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1407",
        "userId": "u_7",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1408",
        "userId": "u_9",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1409",
        "userId": "u_9",
        "date": "2026-02-26",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1410",
        "userId": "u_9",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1411",
        "userId": "u_10",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1412",
        "userId": "u_10",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1413",
        "userId": "u_11",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1414",
        "userId": "u_11",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1415",
        "userId": "u_11",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1416",
        "userId": "u_11",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1417",
        "userId": "u_11",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1418",
        "userId": "u_12",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1419",
        "userId": "u_12",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1420",
        "userId": "u_14",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1421",
        "userId": "u_14",
        "date": "2026-02-26",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1422",
        "userId": "u_15",
        "date": "2026-02-26",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1423",
        "userId": "u_15",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 40,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1424",
        "userId": "u_16",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1425",
        "userId": "u_16",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1426",
        "userId": "u_17",
        "date": "2026-02-26",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1427",
        "userId": "u_17",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1428",
        "userId": "u_17",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1429",
        "userId": "u_17",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1430",
        "userId": "u_18",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1431",
        "userId": "u_20",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1432",
        "userId": "u_20",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1433",
        "userId": "u_20",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1434",
        "userId": "u_21",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1435",
        "userId": "u_21",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1436",
        "userId": "u_21",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1437",
        "userId": "u_22",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1438",
        "userId": "u_24",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1439",
        "userId": "u_24",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1440",
        "userId": "u_24",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1441",
        "userId": "u_24",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1442",
        "userId": "u_25",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1443",
        "userId": "u_25",
        "date": "2026-02-26",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1444",
        "userId": "u_25",
        "date": "2026-02-26",
        "category": "Movement",
        "points": 20,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1445",
        "userId": "u_26",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1446",
        "userId": "u_28",
        "date": "2026-02-26",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1447",
        "userId": "u_28",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1448",
        "userId": "u_28",
        "date": "2026-02-26",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1449",
        "userId": "u_28",
        "date": "2026-02-26",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1450",
        "userId": "u_sandeep",
        "date": "2026-02-27",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1451",
        "userId": "u_sandeep",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1452",
        "userId": "u_2",
        "date": "2026-02-27",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1453",
        "userId": "u_3",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1454",
        "userId": "u_3",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1455",
        "userId": "u_3",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1456",
        "userId": "u_3",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1457",
        "userId": "u_3",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1458",
        "userId": "u_5",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1459",
        "userId": "u_5",
        "date": "2026-02-27",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1460",
        "userId": "u_5",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1461",
        "userId": "u_6",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1462",
        "userId": "u_6",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1463",
        "userId": "u_7",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1464",
        "userId": "u_7",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1465",
        "userId": "u_7",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1466",
        "userId": "u_8",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1467",
        "userId": "u_8",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1468",
        "userId": "u_9",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1469",
        "userId": "u_9",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1470",
        "userId": "u_10",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1471",
        "userId": "u_14",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1472",
        "userId": "u_14",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1473",
        "userId": "u_14",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1474",
        "userId": "u_14",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1475",
        "userId": "u_15",
        "date": "2026-02-27",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1476",
        "userId": "u_16",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 60,
        "duration": 180,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1477",
        "userId": "u_16",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1478",
        "userId": "u_17",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1479",
        "userId": "u_17",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1480",
        "userId": "u_18",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1481",
        "userId": "u_18",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1482",
        "userId": "u_18",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1483",
        "userId": "u_18",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1484",
        "userId": "u_19",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1485",
        "userId": "u_19",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1486",
        "userId": "u_20",
        "date": "2026-02-27",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1487",
        "userId": "u_20",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1488",
        "userId": "u_20",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1489",
        "userId": "u_20",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1490",
        "userId": "u_21",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1491",
        "userId": "u_21",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1492",
        "userId": "u_21",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1493",
        "userId": "u_22",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1494",
        "userId": "u_22",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1495",
        "userId": "u_23",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1496",
        "userId": "u_23",
        "date": "2026-02-27",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1497",
        "userId": "u_23",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1498",
        "userId": "u_25",
        "date": "2026-02-27",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1499",
        "userId": "u_25",
        "date": "2026-02-27",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1500",
        "userId": "u_25",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 30,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1501",
        "userId": "u_25",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1502",
        "userId": "u_26",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1503",
        "userId": "u_26",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1504",
        "userId": "u_27",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1505",
        "userId": "u_27",
        "date": "2026-02-27",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1506",
        "userId": "u_27",
        "date": "2026-02-27",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1507",
        "userId": "u_28",
        "date": "2026-02-27",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1508",
        "userId": "u_29",
        "date": "2026-02-27",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1509",
        "userId": "u_sandeep",
        "date": "2026-02-28",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1510",
        "userId": "u_sandeep",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1511",
        "userId": "u_sandeep",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1512",
        "userId": "u_sandeep",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1513",
        "userId": "u_sandeep",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1514",
        "userId": "u_1",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1515",
        "userId": "u_1",
        "date": "2026-02-28",
        "category": "Power",
        "points": 20,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1516",
        "userId": "u_1",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1517",
        "userId": "u_1",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1518",
        "userId": "u_1",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1519",
        "userId": "u_3",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1520",
        "userId": "u_3",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1521",
        "userId": "u_3",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1522",
        "userId": "u_4",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1523",
        "userId": "u_4",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1524",
        "userId": "u_6",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1525",
        "userId": "u_6",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1526",
        "userId": "u_6",
        "date": "2026-02-28",
        "category": "Power",
        "points": 15,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1527",
        "userId": "u_6",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1528",
        "userId": "u_7",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1529",
        "userId": "u_7",
        "date": "2026-02-28",
        "category": "Power",
        "points": 60,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1530",
        "userId": "u_7",
        "date": "2026-02-28",
        "category": "Power",
        "points": 20,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1531",
        "userId": "u_8",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1532",
        "userId": "u_8",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1533",
        "userId": "u_8",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1534",
        "userId": "u_11",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1535",
        "userId": "u_11",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1536",
        "userId": "u_11",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1537",
        "userId": "u_15",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1538",
        "userId": "u_15",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1539",
        "userId": "u_15",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1540",
        "userId": "u_15",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1541",
        "userId": "u_16",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1542",
        "userId": "u_16",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1543",
        "userId": "u_16",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1544",
        "userId": "u_16",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1545",
        "userId": "u_17",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1546",
        "userId": "u_17",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1547",
        "userId": "u_20",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 45,
        "duration": 90,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1548",
        "userId": "u_20",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1549",
        "userId": "u_20",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1550",
        "userId": "u_20",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1551",
        "userId": "u_20",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1552",
        "userId": "u_21",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1553",
        "userId": "u_21",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1554",
        "userId": "u_21",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1555",
        "userId": "u_21",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1556",
        "userId": "u_24",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1557",
        "userId": "u_24",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1558",
        "userId": "u_25",
        "date": "2026-02-28",
        "category": "Power",
        "points": 40,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1559",
        "userId": "u_25",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1560",
        "userId": "u_27",
        "date": "2026-02-28",
        "category": "Sports",
        "points": 40,
        "duration": 120,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1561",
        "userId": "u_27",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 10,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1562",
        "userId": "u_27",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 30,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1563",
        "userId": "u_27",
        "date": "2026-02-28",
        "category": "Zen",
        "points": 5,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1564",
        "userId": "u_27",
        "date": "2026-02-28",
        "category": "WeekendDuo",
        "points": 200,
        "isWeekendChallenge": true
    },
    {
        "id": "a_1565",
        "userId": "u_28",
        "date": "2026-02-28",
        "category": "Flow",
        "points": 15,
        "duration": 30,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1566",
        "userId": "u_28",
        "date": "2026-02-28",
        "category": "Movement",
        "points": 20,
        "duration": 60,
        "isWeekendChallenge": false
    },
    {
        "id": "a_1567",
        "userId": "u_28",
        "date": "2026-02-28",
        "category": "WeekendPhoto",
        "points": 100,
        "isWeekendChallenge": true
    }
];

const initialWeekendChallenges: WeekendChallenge[] = [
    { id: 'wc_1', weekNo: 'Week 1', name: 'The Global Handshake', description: 'Identity Building: Every team member must post a "sweaty selfie" or a photo of their workout gear in the group chat. Teams must also finalize their "Cross-Border Team Name."', bonusPointsDesc: '+50 pts (If 100% of team participates)', isVisible: true },
    { id: 'wc_2', weekNo: 'Week 2', name: 'The Time-Zone Relay', description: '24-Hour Movement: The team must coordinate so that at least one activity is logged in each of the three regions (India, Mexico, US) over the 48-hour weekend window.', bonusPointsDesc: '+75 pts (Flat Team Bonus)', isVisible: false },
    { id: 'wc_3', weekNo: 'Week 3', name: 'The Landmark Hunt', description: 'Cultural Exchange: Walk, run, or cycle to a local landmark (e.g., a temple in India, a plaza in Mexico, or a park in the US). Share a photo and one "Fun Fact" about it.', bonusPointsDesc: '+20 pts (Per unique landmark)', isVisible: false },
    { id: 'wc_4', weekNo: 'Week 4', name: 'The "Global Duo" Sync', description: 'Non-Work Connection: Complete a 15-minute "Walk & Talk" video call with a teammate from a different country. Topic: Anything except work (hobbies, food, travel).', bonusPointsDesc: '+100 pts (Per duo pair)', isVisible: false },
    { id: 'wc_5', weekNo: 'Week 5', name: 'The Family & Sport Fest', description: 'Community Building: Log 60 minutes of a sport (Cricket, Golf, Pickleball) with a friend or family member. Post a "Guest Player" photo to the app/chat.', bonusPointsDesc: '+60 pts (Per teammate participation)', isVisible: false },
    { id: 'wc_6', weekNo: 'Week 6', name: 'The Final Summit', description: 'Massive Milestone: The team must collectively hit a "Big Goal" (e.g., 50 cumulative kilometers or 500 total minutes) to cross the virtual finish line together.', bonusPointsDesc: '+200 pts (Grand Finale Bonus)', isVisible: false }
];

const now = Date.now();
const initialPosts: Post[] = [
    {
        id: 'post_1',
        userId: 'u_sandeep',
        content: 'Just finished an intense 60-min power lifting session! 💪 Who else is hitting the gym today?',
        mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        createdAt: now - 1000 * 60 * 60 * 2,
        likes: ['u_1', 'u_2', 'u_5', 'u_10'],
        comments: [
            { id: 'c_1', userId: 'u_1', content: 'Beast mode! 🦍', createdAt: now - 1000 * 60 * 60 * 1.8 }
        ]
    },
    {
        id: 'post_2',
        userId: 'u_6',
        content: 'Beautiful morning run across the local plaza here in Mexico! 🇲🇽 Loved the vibrant colors. #WeekendChallenge',
        mediaUrl: 'https://images.unsplash.com/photo-1584345244565-349f4c3d88bd?w=800&q=80',
        createdAt: now - 1000 * 60 * 60 * 24,
        weekendChallengeId: 'wc_3',
        likes: ['u_5', 'u_6', 'u_sandeep', 'u_7', 'u_15'],
        comments: [
            { id: 'c_3', userId: 'u_sandeep', content: 'Looks absolutely stunning! Keep it up team!', createdAt: now - 1000 * 60 * 60 * 18 },
            { id: 'c_4', userId: 'u_15', content: 'What a perfect way to start the day. 🏃‍♂️', createdAt: now - 1000 * 60 * 60 * 12 }
        ]
    },
    {
        id: 'post_3',
        userId: 'u_10',
        content: 'Started jumping rope again! Here is a clip from today. It is a fantastic full-body cardio workout.',
        mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        createdAt: now - 1000 * 60 * 60 * 48,
        likes: ['u_11', 'u_12', 'u_sandeep', 'u_3'],
        comments: [
            { id: 'c_5', userId: 'u_3', content: 'Need to get myself a jump rope too.', createdAt: now - 1000 * 60 * 60 * 45 }
        ]
    },
    {
        id: 'post_4',
        userId: 'u_25',
        content: 'Had a super refreshing 15-minute "Walk & Talk" call with the team. So great to connect and talk about our favorite foods and travels instead of work! 🤝🌍',
        mediaUrl: 'https://images.unsplash.com/photo-1543269664-56d5d54278b7?w=800&q=80',
        createdAt: now - 1000 * 60 * 60 * 72,
        weekendChallengeId: 'wc_4',
        likes: ['u_26', 'u_27', 'u_sandeep', 'u_5', 'u_15'],
        comments: [
            { id: 'c_6', userId: 'u_27', content: 'Had a fun time catching up! We need to share those recipes soon.', createdAt: now - 1000 * 60 * 60 * 70 }
        ]
    },
    {
        id: 'post_5',
        userId: 'u_15',
        content: 'Just smashed a 10km cycle to clear my head. Remember to stay hydrated out there, folks! 🚴‍♀️💧',
        mediaUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&q=80',
        createdAt: now - 1000 * 60 * 60 * 12,
        likes: ['u_16', 'u_18', 'u_20'],
        comments: []
    }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('fit_curr_user_v2', null);
    const [users, setUsers] = useLocalStorage<User[]>('fit_users_v2', initialUsers);
    const [teams, setTeams] = useLocalStorage<Team[]>('fit_teams_v2', initialTeams);
    const [activities, setActivities] = useLocalStorage<ActivityLog[]>('fit_act_v2', initialActivities);
    const [isWeekendChallengePublished, setIsWeekendChallengePublished] = useLocalStorage('fitness_weekend_published', false);
    const [weekendChallenges, setWeekendChallenges] = useLocalStorage<WeekendChallenge[]>('fit_weekend_chals_v2', initialWeekendChallenges);
    const [teamBonusPoints, setTeamBonusPoints] = useLocalStorage<TeamBonusPoint[]>('fit_team_bonus_v1', []);
    const [posts, setPosts] = useLocalStorage<Post[]>('fit_posts_v2', initialPosts);
    const [awards, setAwards] = useLocalStorage<Award[]>('fit_awards_v1', []);
    const [resetTokens, setResetTokens] = useLocalStorage<ResetToken[]>('fitness_reset_tokens', []);

    // Need this to prevent hydration mismatch with localStorage
    const [isMounted, setIsMounted] = useState(false);
    
    // FETCH REAL DB DATA ON LOAD
    useEffect(() => {
        setIsMounted(true);
        const initDb = async () => {
            // First run the seeder quietly in background 
            // (it safely skips itself if DB has users)
            await seedInitialData({ initialUsers, initialTeams, initialActivities, initialPosts });
            
            // Now pull the real synchronized DB data
            const dbData = await fetchAllData();
            if (dbData.users.length > 0) {
                setUsers(dbData.users);
                setTeams(dbData.teams);
                setActivities(dbData.activities);
                setWeekendChallenges(dbData.weekendChallenges);
                setTeamBonusPoints(dbData.teamBonusPoints);
                setPosts(dbData.posts);
                if (dbData.awards && dbData.awards.length > 0) setAwards(dbData.awards);
                
                // Keep the current logged-in user totally synced
                if (currentUser) {
                    const freshUser = dbData.users.find((u: User) => u.id === currentUser.id);
                    if (freshUser) setCurrentUser(freshUser);
                }
            }
        };
        initDb();
    }, []);

    const loginUser = (name: string, password?: string) => {
        // Match by username field first, then fall back to name (backward compat)
        const nameLower = name.trim().toLowerCase();
        const existingUser = users.find(
            u => (u.username || '').toLowerCase() === nameLower || u.name.toLowerCase() === nameLower
        );

        if (!existingUser) {
            return { success: false, message: 'User not found.' };
        }

        if (existingUser.password && existingUser.password !== password) {
            return { success: false, message: 'Invalid password.' };
        }

        setCurrentUser(existingUser);
        return { success: true };
    };

    const registerUser = (userData: Omit<User, 'id'>) => {
        // Check username uniqueness
        const unameLower = (userData.username || userData.name).trim().toLowerCase();
        const existingByUsername = users.find(
            u => (u.username || u.name).toLowerCase() === unameLower
        );
        if (existingByUsername) {
            return { success: false, message: 'Username already taken.' };
        }

        // Check email uniqueness if provided
        if (userData.email) {
            const existingByEmail = users.find(
                u => (u.email || '').toLowerCase() === userData.email!.toLowerCase()
            );
            if (existingByEmail) {
                return { success: false, message: 'Email already registered.' };
            }
        }

        const newUser: User = { ...userData, id: generateMockId(), role: 'user' };
        
        // Optimistic UX Update
        setUsers([...users, newUser]);
        setCurrentUser(newUser);

        // Push to SQLite DB seamlessly
        registerUserDB(userData).then(res => {
            if (res.success && res.user) {
                setCurrentUser(res.user as User);
            }
        });

        return { success: true };
    };

    const logoutUser = () => {
        setCurrentUser(null);
    };

    const requestPasswordReset = (emailOrUsername: string) => {
        const query = emailOrUsername.trim().toLowerCase();
        const user = users.find(
            u => (u.username || '').toLowerCase() === query
                || (u.email || '').toLowerCase() === query
                || u.name.toLowerCase() === query
        );

        if (!user) {
            return { success: false, message: 'No account found with that email or username.' };
        }

        // Generate token
        const token = generateMockId() + '-' + Date.now();
        const newResetToken: ResetToken = {
            token,
            userId: user.id,
            expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        };

        // Remove any existing tokens for this user and add new one
        setResetTokens([...resetTokens.filter(t => t.userId !== user.id), newResetToken]);

        // In a real app, this would send an email. For demo, return the link.
        const resetLink = `/reset-password?token=${token}`;
        return {
            success: true,
            message: user.email
                ? `Password reset link sent to ${user.email}`
                : 'Password reset link generated.',
            resetLink,
        };
    };

    const resetPassword = (token: string, newPassword: string) => {
        const tokenEntry = resetTokens.find(t => t.token === token);
        if (!tokenEntry) {
            return { success: false, message: 'Invalid or expired reset link.' };
        }
        if (Date.now() > tokenEntry.expiresAt) {
            // Clean up expired token
            setResetTokens(resetTokens.filter(t => t.token !== token));
            return { success: false, message: 'This reset link has expired. Please request a new one.' };
        }

        // Update the user's password
        setUsers(users.map(u =>
            u.id === tokenEntry.userId ? { ...u, password: newPassword } : u
        ));

        // Remove used token
        setResetTokens(resetTokens.filter(t => t.token !== token));

        return { success: true, message: 'Password has been reset successfully.' };
    };

    const createTeam = (name: string, brandImageUrl?: string) => {
        if (!currentUser) return '';
        const newTeamId = generateMockId();
        const newTeam: Team = {
            id: newTeamId,
            name,
            members: [currentUser.id],
            captainId: currentUser.id,
            pendingRequests: [],
            brandImageUrl
        };

        setTeams([...teams, newTeam]);

        // Update user
        const updatedUser = { ...currentUser, teamId: newTeamId };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

        return newTeamId;
    };

    const updateTeam = (teamId: string, updates: { name?: string; brandImageUrl?: string }) => {
        if (!currentUser) return { success: false, message: 'Not logged in.' };
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex === -1) return { success: false, message: 'Team not found.' };

        const team = teams[teamIndex];
        if (team.captainId !== currentUser.id && currentUser.role !== 'admin') {
            return { success: false, message: 'Only the captain can edit the team.' };
        }

        const updatedTeams = [...teams];
        updatedTeams[teamIndex] = { ...team, ...updates };
        setTeams(updatedTeams);

        return { success: true, message: 'Team updated successfully.' };
    };

    const requestJoinTeam = (teamId: string) => {
        if (!currentUser) return { success: false, message: 'Not logged in' };

        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, message: 'Team not found' };
        if (team.members.length >= 4) return { success: false, message: 'Team has reached maximum capacity.' };
        if (team.pendingRequests.includes(currentUser.id)) return { success: false, message: 'Request already pending' };

        // Instead of strict enforcement, we allow the request and validate on approve.
        // Update team pending requests
        const updatedPending = [...team.pendingRequests, currentUser.id];
        setTeams(teams.map(t => t.id === teamId ? { ...t, pendingRequests: updatedPending } : t));

        return { success: true, message: 'Join request sent to captain!' };
    };

    const approveJoinRequest = (teamId: string, userId: string) => {
        if (!currentUser) return { success: false, message: 'Not logged in' };

        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, message: 'Team not found' };
        if (team.captainId !== currentUser.id) return { success: false, message: 'Only captain can approve' };
        if (team.members.length >= 4) return { success: false, message: 'Team has reached maximum capacity.' };

        // Update team
        const updatedMembers = [...team.members, userId];
        const updatedPending = team.pendingRequests.filter(id => id !== userId);
        setTeams(teams.map(t => t.id === teamId ? { ...t, members: updatedMembers, pendingRequests: updatedPending } : t));

        // Update target user
        setUsers(users.map(u => u.id === userId ? { ...u, teamId: teamId } : u));

        return { success: true };
    };

    const rejectJoinRequest = (teamId: string, userId: string) => {
        if (!currentUser) return;
        const team = teams.find(t => t.id === teamId);
        if (!team || team.captainId !== currentUser.id) return;

        const updatedPending = team.pendingRequests.filter(id => id !== userId);
        setTeams(teams.map(t => t.id === teamId ? { ...t, pendingRequests: updatedPending } : t));
    };

    const transferCaptain = (teamId: string, newCaptainId: string) => {
        if (!currentUser) return;
        const team = teams.find(t => t.id === teamId);
        if (!team || team.captainId !== currentUser.id) return;
        if (!team.members.includes(newCaptainId)) return;

        setTeams(teams.map(t => t.id === teamId ? { ...t, captainId: newCaptainId } : t));
    };

    const removeMember = (teamId: string, userId: string) => {
        if (!currentUser) return { success: false, message: 'Not logged in' };

        const team = teams.find(t => t.id === teamId);
        if (!team) return { success: false, message: 'Team not found' };
        if (team.captainId !== currentUser.id) return { success: false, message: 'Only the captain can remove members' };
        if (userId === currentUser.id) return { success: false, message: 'Captain cannot remove themselves. Use Leave Team instead.' };
        if (!team.members.includes(userId)) return { success: false, message: 'User is not a member of this team' };

        // Remove user from team members
        const updatedMembers = team.members.filter(id => id !== userId);
        setTeams(teams.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t));

        // Clear the removed user's teamId
        setUsers(users.map(u => u.id === userId ? { ...u, teamId: null } : u));

        return { success: true, message: 'Member removed from team.' };
    };

    const leaveTeam = () => {
        if (!currentUser || !currentUser.teamId) return { success: false, message: 'Not in a team.' };

        const prevTeamId = currentUser.teamId;
        const team = teams.find(t => t.id === prevTeamId);
        if (!team) return { success: false, message: 'Team not found.' };

        // Captain cannot leave if there are other members — must transfer captaincy first
        if (team.captainId === currentUser.id && team.members.length > 1) {
            return { success: false, message: 'You must transfer captaincy to another member before leaving the team.' };
        }

        // Update user
        const updatedUser = { ...currentUser, teamId: null };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

        // Update team
        const newMembers = team.members.filter(id => id !== currentUser.id);
        if (newMembers.length === 0) {
            // Last member leaving — remove the team
            setTeams(teams.filter(t => t.id !== prevTeamId));
        } else {
            setTeams(teams.map(t => t.id === prevTeamId ? { ...t, members: newMembers } : t));
        }
        return { success: true };
    };

    const logActivity = (activity: Omit<ActivityLog, 'id' | 'userId'>) => {
        if (!currentUser) return { success: false, message: 'Not logged in' };

        // 1. Cap validation (Optimistic Check)
        const myTodayActivities = activities.filter(a => a.userId === currentUser.id && a.date === activity.date && !a.isWeekendChallenge);
        const myTodayPoints = myTodayActivities.reduce((sum, a) => sum + a.points, 0);

        if (!activity.isWeekendChallenge) {
            if (myTodayPoints >= 100) return { success: false, message: 'Daily limit of 100 pts reached.' };
            if (myTodayPoints + activity.points > 100) {
                activity.points = 100 - myTodayPoints; // cap the points
            }
        }

        const newLog: ActivityLog = {
            ...activity,
            id: generateMockId('act'),
            userId: currentUser.id
        };

        // UI updates instantly
        setActivities([...activities, newLog]);

        // Background push to SQLite DB
        logActivityDB({
            userId: currentUser.id,
            date: activity.date,
            category: activity.category,
            points: activity.points,
            duration: activity.duration,
            stepCount: activity.stepCount,
            bonusPoints: activity.bonusPoints,
            isWeekendChallenge: activity.isWeekendChallenge || false
        });

        return { success: true };
    };

    const updateProfile = (updates: { fullName?: string; contactNumber?: string; workStream?: User['workStream']; location?: User['location'] }) => {
        if (!currentUser) return { success: false, message: 'Not logged in.' };
        const updated = { ...currentUser, ...updates };
        if (updates.fullName) updated.name = updates.fullName;
        setCurrentUser(updated);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        return { success: true, message: 'Profile updated successfully.' };
    };

    const changePassword = (currentPassword: string, newPassword: string) => {
        if (!currentUser) return { success: false, message: 'Not logged in.' };
        if (currentUser.password && currentUser.password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect.' };
        }
        const updated = { ...currentUser, password: newPassword };
        setCurrentUser(updated);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
        return { success: true, message: 'Password changed successfully.' };
    };

    const toggleWeekendChallenge = (published: boolean) => {
        if (currentUser?.role === 'admin') {
            setIsWeekendChallengePublished(published);
        }
    };

    const createWeekendChallenge = (data: Omit<WeekendChallenge, 'id'>) => {
        if (currentUser?.role !== 'admin') return;
        setWeekendChallenges(prev => [...prev, { ...data, id: generateMockId('wc') }]);
    };
    const updateWeekendChallenge = (id: string, data: Partial<WeekendChallenge>) => {
        if (currentUser?.role !== 'admin') return;
        setWeekendChallenges(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    };
    const deleteWeekendChallenge = (id: string) => {
        if (currentUser?.role !== 'admin') return;
        setWeekendChallenges(prev => prev.filter(c => c.id !== id));
    };
    const setWeekendChallengeVisibility = (id: string, isVisible: boolean) => {
        if (currentUser?.role !== 'admin') return;
        setWeekendChallenges(prev => prev.map(c => ({
            ...c,
            isVisible: c.id === id ? isVisible : (isVisible ? false : c.isVisible)
        })));
    };
    const awardTeamBonusPoint = (data: Omit<TeamBonusPoint, 'id'>) => {
        if (currentUser?.role !== 'admin') return;
        setTeamBonusPoints(prev => [...prev, { ...data, id: generateMockId('tb') }]);
    };
    const removeTeamBonusPoint = (id: string) => {
        if (currentUser?.role !== 'admin') return;
        setTeamBonusPoints(prev => prev.filter(p => p.id !== id));
    };

    const createPost = (data: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
        if (!currentUser) return;
        const newPost: Post = {
            ...data,
            id: generateMockId('post'),
            createdAt: Date.now(),
            likes: [],
            comments: []
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const addComment = (postId: string, content: string) => {
        if (!currentUser) return;
        const newComment: Comment = {
            id: generateMockId('comment'),
            userId: currentUser.id,
            content,
            createdAt: Date.now()
        };
        setPosts(prev => prev.map(post =>
            post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
        ));
    };

    const toggleLikePost = (postId: string) => {
        if (!currentUser) return;
        setPosts(prev => prev.map(post => {
            if (post.id !== postId) return post;
            const hasLiked = post.likes.includes(currentUser.id);
            if (hasLiked) {
                return { ...post, likes: post.likes.filter(id => id !== currentUser.id) };
            } else {
                return { ...post, likes: [...post.likes, currentUser.id] };
            }
        }));
    };

    const addAward = (data: Omit<Award, 'id'>) => {
        setAwards(prev => [...prev, { ...data, id: generateMockId() }]);
    };

    const removeAward = (id: string) => {
        setAwards(prev => prev.filter(a => a.id !== id));
    };

    if (!isMounted) return null; // Avoid SSR hydration mismatch

    return (
        <AppContext.Provider value={{
            currentUser, users, teams, activities, isWeekendChallengePublished,
            weekendChallenges, teamBonusPoints, posts, awards,
            loginUser, registerUser, logoutUser, requestPasswordReset, resetPassword,
            updateProfile, changePassword,
            createTeam, updateTeam, requestJoinTeam, leaveTeam,
            approveJoinRequest, rejectJoinRequest, transferCaptain, removeMember, logActivity, toggleWeekendChallenge,
            createWeekendChallenge, updateWeekendChallenge, deleteWeekendChallenge, setWeekendChallengeVisibility,
            awardTeamBonusPoint, removeTeamBonusPoint,
            createPost, addComment, toggleLikePost,
            addAward, removeAward
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
