'use client';

import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';

export default function AllTeamsPage() {
    const { users, teams } = useAppContext();

    // Only show teams with actual members
    const validTeams = teams.filter(t => Array.isArray(t.members) && t.members.length > 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    All Teams
                </h1>
                <p className="text-slate-500 mt-1">
                    Browse all teams and their members participating in the challenge.
                </p>
            </div>

            {/* Summary bar */}
            <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{validTeams.length}</div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Teams</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">
                            {validTeams.reduce((sum, t) => sum + (t.members || []).length, 0)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Participants</div>
                    </div>
                </div>
            </div>

            {/* Teams Grid */}
            {validTeams.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-600 mb-1">No Teams Yet</h3>
                    <p className="text-sm text-slate-400">Teams will appear here once they are created.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {validTeams.map(team => {
                        const members = (team.members || [])
                            .map(id => users.find(u => u.id === id))
                            .filter(Boolean);
                        const captain = users.find(u => u.id === team.captainId);

                        // Diversity check
                        const geos = new Set(members.map(m => m?.location));
                        const streams = new Set(members.map(m => m?.workStream));
                        const diversityMet = members.length > 3 && geos.size >= 2 && streams.size >= 2;

                        return (
                            <div
                                key={team.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Team Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold">{team.name}</h2>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${members.length >= 5 ? 'bg-red-500/80' : 'bg-white/20'}`}>
                                            {members.length}/5
                                        </span>
                                    </div>
                                    {captain && (
                                        <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            Captain: {captain.name}
                                        </p>
                                    )}
                                </div>

                                {/* Members List */}
                                <div className="p-4">
                                    {/* Diversity Badge */}
                                    {members.length > 3 && (
                                        <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${diversityMet
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                            {diversityMet ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    Diversity Rule Met — {geos.size} Geo, {streams.size} Streams
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Needs Diversity — {geos.size} Geo, {streams.size} Streams
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <ul className="divide-y divide-slate-100">
                                        {members.map(member => {
                                            if (!member) return null;
                                            const isCaptain = member.id === team.captainId;

                                            return (
                                                <li key={member.id} className="flex items-center justify-between py-3">
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar placeholder */}
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${isCaptain
                                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                                            : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                                                            }`}>
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-800 text-sm">{member.name}</span>
                                                                {isCaptain && (
                                                                    <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Captain</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-0.5">
                                                                {member.workStream} • {member.location}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
