/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { Team } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a Date object as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString) */
function toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function getWeekMonday(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    const dow = d.getDay();
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const mon = new Date(d);
    mon.setDate(d.getDate() + mondayOffset);
    return toLocalDateStr(mon);
}

/** Returns all 7 days (Mon→Sun) for a week given its Monday date string */
function getWeekDays(mondayStr: string): string[] {
    const mon = new Date(mondayStr + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return toLocalDateStr(d);
    });
}

function fmtDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { day: days[d.getDay()], date: `${d.getDate()} ${months[d.getMonth()]}` };
}

function fmtWeekRange(weekStart: string) {
    const s = new Date(weekStart + 'T00:00:00');
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`;
}

function pointBadge(pts: number) {
    if (pts >= 100) return 'bg-emerald-100 text-emerald-800';
    if (pts >= 50) return 'bg-blue-100 text-blue-800';
    if (pts >= 20) return 'bg-indigo-50 text-indigo-700';
    if (pts > 0) return 'bg-slate-100 text-slate-600';
    return '';
}

function medal(rank: number) {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
}

// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'teams' | 'individuals';

export default function LeaderboardPage() {
    const { users, teams, activities, teamBonusPoints } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('teams');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

    const todayStr = toLocalDateStr(new Date());
    const currentWeekMonday = getWeekMonday(todayStr);

    const toggleWeek = (wk: string) => {
        setExpandedWeeks(prev => {
            const next = new Set(prev);
            if (next.has(wk)) next.delete(wk);
            else next.add(wk);
            return next;
        });
    };

    // ── Shared: Build weekly data from activities ────────────────────────────

    const { weeklyData, sortedWeeks, pastWeeks } = useMemo(() => {
        const allDates = [...new Set(activities.map(a => a.date))].sort();
        const weeks: Record<string, string[]> = {};
        allDates.forEach(date => {
            const wk = getWeekMonday(date);
            if (!weeks[wk]) weeks[wk] = [];
            if (!weeks[wk].includes(date)) weeks[wk].push(date);
        });
        Object.values(weeks).forEach(arr => arr.sort());
        // Chronological order (oldest week first)
        const sorted = Object.keys(weeks).sort();
        // Past weeks = all weeks except the current week, in chronological order
        const past = sorted.filter(wk => wk !== currentWeekMonday);
        return { weeklyData: weeks, sortedWeeks: sorted, pastWeeks: past };
    }, [activities, currentWeekMonday]);

    // ── Point helpers ────────────────────────────────────────────────────────

    // Points for a set of user IDs on a specific date
    const getGroupPointsOnDate = (userIds: string[], date: string, teamId: string | boolean = false) => {
        let sum = activities.filter(a => userIds.includes(a.userId) && a.date === date)
            .reduce((s, a) => s + a.points, 0);

        if (teamId && userIds.length > 0) {
            // Check if every user in the team logged >0 points on this date
            const allLogged = userIds.every(uid =>
                activities.some(a => a.userId === uid && a.date === date && a.points > 0)
            );
            if (allLogged) sum += 50; // Team multiplayer bonus

            if (typeof teamId === 'string') {
                // Apply any manual team bonus points awarded on this date
                const manualBonus = teamBonusPoints
                    .filter(b => b.teamId === teamId && b.dateStr === date)
                    .reduce((s, b) => s + b.points, 0);
                sum += manualBonus;
            }
        }
        return sum;
    };

    // Weekly total for a set of user IDs
    const getGroupWeeklyTotal = (userIds: string[], weekMonday: string, teamId: string | boolean = false) => {
        const dates = weeklyData[weekMonday] || [];
        return dates.reduce((sum, d) => sum + getGroupPointsOnDate(userIds, d, teamId), 0);
    };

    // Grand total for a set of user IDs
    const getGroupGrandTotal = (userIds: string[], teamId: string | boolean = false) => {
        return sortedWeeks.reduce((sum, wk) => sum + getGroupWeeklyTotal(userIds, wk, teamId), 0);
    };

    const getUserGrandTotal = (userId: string) =>
        getGroupGrandTotal([userId], false);

    // ── Tab 1: Team Scores ──────────────────────────────────────────────────

    const teamRankings = useMemo(() => {
        return teams
            .filter(team => Array.isArray(team.members) && team.members.length > 0)
            .map(team => {
                const memberIds = team.members || [];
                const teamTotal = getGroupGrandTotal(memberIds, team.id);
                return { team, memberIds, teamTotal };
            })
            .sort((a, b) => b.teamTotal - a.teamTotal);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams, activities]);

    // ── Tab 2: Individual Scores ─────────────────────────────────────────────

    const rankedUsers = useMemo(() => {
        return users
            .filter(u => u.role !== 'admin')
            .map(u => ({ ...u, grandTotal: getUserGrandTotal(u.id) }))
            .sort((a, b) => b.grandTotal - a.grandTotal);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, activities]);

    // ── Team Detail View: members of selected team ──────────────────────────

    const teamMembers = useMemo(() => {
        if (!selectedTeam) return [];
        return (selectedTeam.members || [])
            .map(id => {
                const u = users.find(usr => usr.id === id);
                if (!u) return null;
                return { ...u, grandTotal: getUserGrandTotal(u.id) };
            })
            .filter(Boolean) as (typeof users[number] & { grandTotal: number })[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTeam, users, activities]);

    // ── Shared column header renderer ────────────────────────────────────────

    const renderColumnHeaders = () => (
        <>
            {/* Past weeks: weekly totals (Week 1 → last completed week, chronological) */}
            {pastWeeks.map((wk, idx) => (
                <React.Fragment key={wk}>
                    <th
                        className="text-center px-3 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-wider min-w-[80px] cursor-pointer hover:text-indigo-600 transition-colors select-none"
                        onClick={() => toggleWeek(wk)}
                    >
                        <div className="flex items-center justify-center gap-1">
                            <svg className={`w-3 h-3 transition-transform ${expandedWeeks.has(wk) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div>
                                <div>Week {idx + 1}</div>
                                <div className="text-[9px] text-slate-400 font-normal">{fmtWeekRange(wk)}</div>
                            </div>
                        </div>
                    </th>
                    {expandedWeeks.has(wk) && getWeekDays(wk).map(date => {
                        const f = fmtDate(date);
                        return (
                            <th key={date} className="text-center px-2 py-3 font-bold text-slate-400 text-[10px] uppercase tracking-wider min-w-[56px]">
                                <div>{f.day}</div>
                                <div className="text-[9px] font-normal">{f.date}</div>
                            </th>
                        );
                    })}
                </React.Fragment>
            ))}

            {/* Current week: day-wise columns */}
            {sortedWeeks.includes(currentWeekMonday) && (
                <>
                    {(weeklyData[currentWeekMonday] || []).map(date => {
                        const f = fmtDate(date);
                        return (
                            <th key={date} className="text-center px-2 py-3 font-bold text-indigo-600 text-[10px] uppercase tracking-wider min-w-[56px]">
                                <div>{f.day}</div>
                                <div className="text-[9px] text-slate-400 font-normal">{f.date}</div>
                            </th>
                        );
                    })}
                    <th className="text-center px-3 py-3 font-bold text-indigo-700 text-[10px] uppercase tracking-wider bg-indigo-50/50 min-w-[64px]">
                        This Week
                    </th>
                </>
            )}

            {/* Grand Total */}
            <th className="text-center px-4 py-3 font-black text-indigo-800 text-[10px] uppercase tracking-wider bg-indigo-50 min-w-[68px]">
                Total
            </th>
        </>
    );

    // ── Shared data cell renderer for a given set of user IDs ────────────────

    const renderDataCells = (userIds: string[], teamId: string | boolean = false) => (
        <>
            {/* Past week cells: weekly totals (Week 1 → last completed week) */}
            {pastWeeks.map(wk => (
                <React.Fragment key={wk}>
                    <td className="text-center px-3 py-3">
                        {(() => {
                            const total = getGroupWeeklyTotal(userIds, wk, teamId);
                            return total > 0 ? (
                                <span className={`inline-block min-w-[36px] px-1.5 py-1 rounded text-xs font-bold ${pointBadge(total)}`}>
                                    {total}
                                </span>
                            ) : (
                                <span className="text-slate-300 text-xs">–</span>
                            );
                        })()}
                    </td>
                    {expandedWeeks.has(wk) && getWeekDays(wk).map(date => {
                        const pts = getGroupPointsOnDate(userIds, date, teamId);
                        return (
                            <td key={date} className="text-center px-2 py-3">
                                {pts > 0 ? (
                                    <span className={`inline-block min-w-[36px] px-1.5 py-1 rounded text-xs font-bold ${pointBadge(pts)}`}>
                                        {pts}
                                    </span>
                                ) : (
                                    <span className="text-slate-300 text-xs">–</span>
                                )}
                            </td>
                        );
                    })}
                </React.Fragment>
            ))}

            {/* Current week: day-wise cells */}
            {sortedWeeks.includes(currentWeekMonday) && (
                <>
                    {(weeklyData[currentWeekMonday] || []).map(date => {
                        const pts = getGroupPointsOnDate(userIds, date, teamId);
                        return (
                            <td key={date} className="text-center px-2 py-3">
                                {pts > 0 ? (
                                    <span className={`inline-block min-w-[36px] px-1.5 py-1 rounded text-xs font-bold ${pointBadge(pts)}`}>
                                        {pts}
                                    </span>
                                ) : (
                                    <span className="text-slate-300 text-xs">–</span>
                                )}
                            </td>
                        );
                    })}
                    <td className="text-center px-3 py-3 bg-indigo-50/30">
                        <span className="font-bold text-indigo-700 text-xs">
                            {getGroupWeeklyTotal(userIds, currentWeekMonday, teamId)}
                        </span>
                    </td>
                </>
            )}

            {/* Grand Total */}
            <td className="text-center px-4 py-3 bg-indigo-50/50">
                <span className="font-black text-indigo-800 text-sm">{getGroupGrandTotal(userIds, teamId)}</span>
            </td>
        </>
    );

    // ── Handle team click ────────────────────────────────────────────────────

    const handleTeamClick = (team: Team) => {
        setSelectedTeam(team);
        setExpandedWeeks(new Set());
    };

    const handleBackToTeams = () => {
        setSelectedTeam(null);
        setExpandedWeeks(new Set());
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Leaderboard
                    </h1>
                    <p className="text-slate-500 mt-1">Track team &amp; individual performance across the challenge.</p>
                </div>
            </div>

            {/* Tab Switcher — hidden when drilling into a team */}
            {!selectedTeam && (
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'teams'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Team Scores
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('individuals')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'individuals'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Individual Scores
                        </span>
                    </button>
                </div>
            )}

            {/* ═══════ TEAM DETAIL VIEW ═══════ */}
            {selectedTeam && (
                <div className="space-y-4">
                    {/* Back button + team name */}
                    <button
                        onClick={handleBackToTeams}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Team Scores
                    </button>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {selectedTeam.name} — Member Scores
                            </h2>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                                {(selectedTeam.members || []).length} member{(selectedTeam.members || []).length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="text-center px-3 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-10">#</th>
                                        <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[120px]">Member</th>
                                        {renderColumnHeaders()}
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamMembers
                                        .sort((a, b) => b.grandTotal - a.grandTotal)
                                        .map((member, idx) => (
                                            <tr key={member.id} className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                                <td className="text-center px-3 py-3">
                                                    <span className={`text-sm font-black ${idx < 3 ? '' : 'text-slate-400'}`}>
                                                        {medal(idx)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                                                    <div className="flex items-center gap-3 w-max">
                                                        {member.avatarUrl ? (
                                                            <div className="w-8 h-8 rounded-full shadow-sm border border-slate-200 overflow-hidden bg-white shrink-0">
                                                                <img src={member.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-800">{member.name}</span>
                                                                {member.id === selectedTeam.captainId && (
                                                                    <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">C</span>
                                                                )}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">{member.workStream} • {member.location}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {renderDataCells([member.id])}
                                            </tr>
                                        ))}
                                    {/* Team total row */}
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t-2 border-indigo-200">
                                        <td className="px-3 py-3"></td>
                                        <td className="px-4 py-3 sticky left-0 bg-indigo-50 z-10">
                                            <span className="font-black text-indigo-800 text-xs uppercase">Team Total</span>
                                        </td>
                                        {renderDataCells(selectedTeam.members || [], selectedTeam.id)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ TAB 1: TEAM SCORES ═══════ */}
            {!selectedTeam && activeTab === 'teams' && (
                <div className="space-y-6">
                    {teamRankings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h3 className="text-lg font-bold text-slate-600 mb-1">No Teams Yet</h3>
                            <p className="text-sm text-slate-400">Teams will appear here once they are created.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Team Scoreboard
                                </h2>
                                <p className="text-indigo-200 text-xs mt-1">Click a team name to see individual member scores</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-center px-3 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-10">#</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[140px]">Team</th>
                                            {renderColumnHeaders()}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teamRankings.map((entry, idx) => (
                                            <tr key={entry.team.id} className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                                {/* Rank */}
                                                <td className="text-center px-3 py-3">
                                                    <span className={`text-sm font-black ${idx < 3 ? '' : 'text-slate-400'}`}>
                                                        {medal(idx)}
                                                    </span>
                                                </td>

                                                {/* Team Name — clickable */}
                                                <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                                                    <button
                                                        onClick={() => handleTeamClick(entry.team)}
                                                        className="text-left group flex items-center gap-3 w-max"
                                                    >
                                                        {entry.team.brandImageUrl ? (
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                                                                <img src={entry.team.brandImageUrl} alt="Team Logo" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                                {entry.team.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-indigo-600 group-hover:text-indigo-800 group-hover:underline transition-colors flex items-center gap-1.5">
                                                                {entry.team.name}
                                                                <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">{entry.memberIds.length} member{entry.memberIds.length !== 1 ? 's' : ''}</div>
                                                        </div>
                                                    </button>
                                                </td>

                                                {/* Score cells — aggregated across all team members */}
                                                {renderDataCells(entry.memberIds, entry.team.id)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ TAB 2: INDIVIDUAL SCORES ═══════ */}
            {!selectedTeam && activeTab === 'individuals' && (
                <div className="space-y-6">
                    {rankedUsers.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="text-lg font-bold text-slate-600 mb-1">No Participants Yet</h3>
                            <p className="text-sm text-slate-400">Scores will appear once participants start logging activities.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Individual Scoreboard
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-center px-3 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-10">#</th>
                                            <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase text-[10px] tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[120px]">Name</th>
                                            {renderColumnHeaders()}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankedUsers.map((user, idx) => {
                                            const team = teams.find(t => (t.members || []).includes(user.id));
                                            return (
                                                <tr key={user.id} className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                                    <td className="text-center px-3 py-3">
                                                        <span className={`text-sm font-black ${idx < 3 ? '' : 'text-slate-400'}`}>
                                                            {medal(idx)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                                                        <div className="flex items-center gap-3 w-max">
                                                            {user.avatarUrl ? (
                                                                <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm overflow-hidden bg-white shrink-0">
                                                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-semibold text-slate-800">{user.name}</div>
                                                                {team && <div className="text-[10px] text-slate-400">{team.name}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {renderDataCells([user.id])}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
