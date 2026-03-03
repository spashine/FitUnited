/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';

export default function TeamsPage() {
    const router = useRouter();
    const {
        currentUser,
        teams,
        users,
        activities,
        createTeam,
        requestJoinTeam,
        leaveTeam,
        approveJoinRequest,
        rejectJoinRequest,
        transferCaptain,
        removeMember,
        updateTeam
    } = useAppContext();

    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamLogo, setNewTeamLogo] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamName, setEditTeamName] = useState('');
    const [editTeamLogo, setEditTeamLogo] = useState('');

    // Protect route
    useEffect(() => {
        if (!currentUser) router.push('/');
    }, [currentUser, router]);

    if (!currentUser) return null;

    const userTeam = currentUser.teamId ? teams.find(t => t.id === currentUser.teamId) : null;
    const isCaptain = userTeam?.captainId === currentUser.id;

    const handleCreateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        createTeam(newTeamName.trim(), newTeamLogo);
        setNewTeamName('');
        setNewTeamLogo('');
        setErrorMsg('');
        setSuccessMsg('Team created successfully. You are now the Captain!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleUpdateTeam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userTeam || !editTeamName.trim()) return;
        const result = updateTeam(userTeam.id, { name: editTeamName.trim(), brandImageUrl: editTeamLogo });
        if (!result.success) {
            setErrorMsg(result.message || 'Error updating team');
            setSuccessMsg('');
        } else {
            setIsEditingTeam(false);
            setErrorMsg('');
            setSuccessMsg('Team updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleJoinTeam = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        if (team && (team.members || []).length >= 5) {
            setErrorMsg('Team has reached maximum capacity.');
            setSuccessMsg('');
            return;
        }
        const result = requestJoinTeam(teamId);
        if (!result.success) {
            setErrorMsg(result.message || 'Error joining team');
            setSuccessMsg('');
        } else {
            setErrorMsg('');
            setSuccessMsg(result.message || 'Join request sent!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleApprove = (userId: string) => {
        if (!userTeam) return;
        const result = approveJoinRequest(userTeam.id, userId);
        if (!result.success) {
            setErrorMsg(result.message || 'Error approving request');
            setSuccessMsg('');
        } else {
            setErrorMsg('');
            setSuccessMsg('Member approved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleReject = (userId: string) => {
        if (!userTeam) return;
        rejectJoinRequest(userTeam.id, userId);
    };

    const handleTransfer = (userId: string) => {
        if (!userTeam || !confirm('Are you sure you want to transfer captaincy to this user?')) return;
        transferCaptain(userTeam.id, userId);
    };

    const handleRemoveMember = (userId: string) => {
        if (!userTeam) return;
        const memberName = users.find(u => u.id === userId)?.name || 'this member';
        if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

        const result = removeMember(userTeam.id, userId);
        if (!result.success) {
            setErrorMsg(result.message || 'Error removing member');
            setSuccessMsg('');
        } else {
            setErrorMsg('');
            setSuccessMsg(result.message || 'Member removed.');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleLeaveTeam = () => {
        const result = leaveTeam();
        if (!result.success) {
            setErrorMsg(result.message || 'Cannot leave team.');
            setSuccessMsg('');
        } else {
            setErrorMsg('');
        }
    };

    // Helper to calculate if diversity rule is met for a team
    const checkDiversity = (memberIds: string[]) => {
        const memberDetails = memberIds.map(id => users.find(u => u.id === id)).filter(Boolean);
        const geos = new Set(memberDetails.map(m => m?.location));
        const streams = new Set(memberDetails.map(m => m?.workStream));
        const valid = geos.size >= 2 && streams.size >= 2;
        return { valid, geoCount: geos.size, streamCount: streams.size };
    };

    // Render team member details
    const renderMembers = () => {
        if (!userTeam) return null;

        return userTeam.members.map(id => {
            const u = users.find(user => user.id === id);
            if (!u) return null;

            const isMemberCaptain = userTeam.captainId === u.id;
            const isSelf = u.id === currentUser.id;

            return (
                <li key={u.id} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 text-sm">
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                            {u.name} {isSelf ? '(You)' : ''}
                            {isMemberCaptain && (
                                <span className="text-[10px] uppercase font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm">Captain</span>
                            )}
                        </span>
                        <span className="text-slate-500 text-xs mt-0.5">
                            {u.workStream} • {u.location}
                        </span>
                    </div>

                    {isCaptain && !isSelf && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleTransfer(u.id)}
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                Make Captain
                            </button>
                            <button
                                onClick={() => handleRemoveMember(u.id)}
                                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </li>
            );
        });
    };

    // Render points table for team
    const renderPointsTable = () => {
        if (!userTeam) return null;

        const teamActivities = activities.filter(a => userTeam.members.includes(a.userId));
        const memberDetails = userTeam.members.map(id => users.find(u => u.id === id)).filter(Boolean);

        if (teamActivities.length === 0) {
            return (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Activity Data Yet</h3>
                    <p className="text-sm text-slate-500">Team members need to log activities to see the points table.</p>
                </div>
            );
        }

        // Collect all unique dates and sort them
        const allDates = [...new Set(teamActivities.map(a => a.date))].sort();

        // Group dates by week (ISO week: Mon-Sun)
        const getWeekKey = (dateStr: string) => {
            const d = new Date(dateStr + 'T00:00:00');
            const dayOfWeek = d.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(d);
            monday.setDate(d.getDate() + mondayOffset);
            return monday.toISOString().split('T')[0];
        };

        const weekGroups: Record<string, string[]> = {};
        allDates.forEach(date => {
            const weekKey = getWeekKey(date);
            if (!weekGroups[weekKey]) weekGroups[weekKey] = [];
            weekGroups[weekKey].push(date);
        });

        const sortedWeeks = Object.keys(weekGroups).sort();

        // Helper: get total points for a member on a specific date
        const getPoints = (userId: string, date: string) => {
            return teamActivities
                .filter(a => a.userId === userId && a.date === date)
                .reduce((sum, a) => sum + a.points, 0);
        };

        // Helper: get only regular (non-weekend) points
        const getRegularPoints = (userId: string, date: string) => {
            return teamActivities
                .filter(a => a.userId === userId && a.date === date && !a.isWeekendChallenge)
                .reduce((sum, a) => sum + a.points, 0);
        };

        // Helper: get only weekend bonus points
        const getWeekendPoints = (userId: string, date: string) => {
            return teamActivities
                .filter(a => a.userId === userId && a.date === date && a.isWeekendChallenge)
                .reduce((sum, a) => sum + a.points, 0);
        };

        // Format date for display
        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr + 'T00:00:00');
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return {
                day: days[d.getDay()],
                date: `${d.getDate()} ${months[d.getMonth()]}`,
            };
        };

        const formatWeekRange = (weekStart: string) => {
            const start = new Date(weekStart + 'T00:00:00');
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]}`;
        };

        // Grand totals per member
        const grandTotals: Record<string, number> = {};
        memberDetails.forEach(m => {
            if (!m) return;
            grandTotals[m.id] = allDates.reduce((sum, date) => sum + getPoints(m.id, date), 0);
        });
        const grandTotalAll = Object.values(grandTotals).reduce((a, b) => a + b, 0);

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Team Points Scoreboard
                    </h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                        Team Total: {grandTotalAll} pts
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-4 py-3 font-bold text-slate-600 uppercase text-xs tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[100px]">
                                    Date
                                </th>
                                {memberDetails.map(m => m && (
                                    <th key={m.id} className="text-center px-3 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider min-w-[90px]">
                                        <div>{m.name.split(' ')[0]}</div>
                                        {m.id === userTeam.captainId && (
                                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black">C</span>
                                        )}
                                    </th>
                                ))}
                                <th className="text-center px-3 py-3 font-bold text-indigo-700 text-xs uppercase tracking-wider min-w-[80px] bg-indigo-50">
                                    Daily Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedWeeks.map((weekKey, weekIdx) => {
                                const weekDates = weekGroups[weekKey];

                                // Calculate weekly totals per member
                                const weeklyTotals: Record<string, number> = {};
                                memberDetails.forEach(m => {
                                    if (!m) return;
                                    weeklyTotals[m.id] = weekDates.reduce((sum, date) => sum + getPoints(m.id, date), 0);
                                });
                                const weeklyTotalAll = Object.values(weeklyTotals).reduce((a, b) => a + b, 0);

                                return (
                                    <React.Fragment key={weekKey}>
                                        {/* Week Header */}
                                        <tr className="bg-slate-100/80">
                                            <td colSpan={memberDetails.length + 2} className="px-4 py-2 font-bold text-slate-600 text-xs uppercase tracking-wider">
                                                📅 Week of {formatWeekRange(weekKey)}
                                            </td>
                                        </tr>

                                        {/* Daily Rows */}
                                        {weekDates.map((date, dateIdx) => {
                                            const formatted = formatDate(date);
                                            const dailyTotal = memberDetails.reduce((sum, m) => {
                                                if (!m) return sum;
                                                return sum + getPoints(m.id, date);
                                            }, 0);

                                            return (
                                                <tr key={date} className={`border-b border-slate-100 ${dateIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-indigo-50/30 transition-colors`}>
                                                    <td className="px-4 py-2.5 sticky left-0 bg-inherit z-10">
                                                        <div className="font-semibold text-slate-800">{formatted.day}</div>
                                                        <div className="text-xs text-slate-400">{formatted.date}</div>
                                                    </td>
                                                    {memberDetails.map(m => {
                                                        if (!m) return null;
                                                        const pts = getPoints(m.id, date);
                                                        const regPts = getRegularPoints(m.id, date);
                                                        const wkndPts = getWeekendPoints(m.id, date);
                                                        return (
                                                            <td key={m.id} className="text-center px-3 py-2.5">
                                                                {pts > 0 ? (
                                                                    <div className="flex flex-col items-center gap-0.5">
                                                                        <span className={`inline-block min-w-[40px] px-2 py-1 rounded-md text-xs font-bold ${pts >= 100 ? 'bg-emerald-100 text-emerald-800' :
                                                                            pts >= 50 ? 'bg-blue-100 text-blue-800' :
                                                                                pts >= 20 ? 'bg-indigo-50 text-indigo-700' :
                                                                                    'bg-slate-100 text-slate-600'
                                                                            }`}>
                                                                            {regPts > 0 ? regPts : pts}
                                                                        </span>
                                                                        {wkndPts > 0 && (
                                                                            <span className="text-[10px] font-bold text-purple-600">+{wkndPts}★</span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-300 text-xs">–</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="text-center px-3 py-2.5 bg-indigo-50/50">
                                                        <span className="font-bold text-indigo-700 text-xs">{dailyTotal}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* Weekly Total Row */}
                                        <tr className="bg-indigo-50 border-b-2 border-indigo-200">
                                            <td className="px-4 py-2.5 font-bold text-indigo-800 text-xs uppercase sticky left-0 bg-indigo-50 z-10">
                                                Week {weekIdx + 1} Total
                                            </td>
                                            {memberDetails.map(m => m && (
                                                <td key={m.id} className="text-center px-3 py-2.5">
                                                    <span className="font-bold text-indigo-700 text-sm">{weeklyTotals[m.id] || 0}</span>
                                                </td>
                                            ))}
                                            <td className="text-center px-3 py-2.5">
                                                <span className="font-black text-indigo-800 text-sm">{weeklyTotalAll}</span>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}

                            {/* Grand Total Row */}
                            <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-300">
                                <td className="px-4 py-3 font-black text-indigo-900 text-sm uppercase sticky left-0 bg-indigo-100 z-10">
                                    🏆 Grand Total
                                </td>
                                {memberDetails.map(m => m && (
                                    <td key={m.id} className="text-center px-3 py-3">
                                        <span className="font-black text-indigo-900 text-base">{grandTotals[m.id] || 0}</span>
                                    </td>
                                ))}
                                <td className="text-center px-3 py-3">
                                    <span className="font-black text-white bg-indigo-600 px-3 py-1 rounded-full text-sm">{grandTotalAll}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Team</h1>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                    <p className="text-red-700 font-medium">{errorMsg}</p>
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-md shadow-sm">
                    <p className="text-emerald-700 font-medium">{successMsg}</p>
                </div>
            )}

            {userTeam ? (
                <>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                                {isEditingTeam && isCaptain ? (
                                    <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
                                        <form onSubmit={handleUpdateTeam} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editTeamName}
                                                    onChange={(e) => setEditTeamName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Logo</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (file.size > 2 * 1024 * 1024) return alert("max 2MB");
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setEditTeamLogo(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }}
                                                />
                                                {editTeamLogo && (
                                                    <div className="mt-2 h-16 w-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                                                        <img src={editTeamLogo} alt="Team logo" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button type="button" onClick={() => setIsEditingTeam(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">Cancel</button>
                                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Save</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-indigo-600 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-white gap-4">
                                        <div className="flex items-center gap-4">
                                            {userTeam.brandImageUrl ? (
                                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-white border-2 border-indigo-400 shadow-sm shrink-0">
                                                    <img src={userTeam.brandImageUrl} alt="Team Logo" className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-xl bg-indigo-500/50 border border-indigo-400 flex items-center justify-center shrink-0">
                                                    <span className="text-2xl font-black text-indigo-100">{userTeam.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-xl font-bold flex items-center gap-2">
                                                    {userTeam.name}
                                                    {isCaptain && (
                                                        <button
                                                            onClick={() => {
                                                                setEditTeamName(userTeam.name);
                                                                setEditTeamLogo(userTeam.brandImageUrl || '');
                                                                setIsEditingTeam(true);
                                                            }}
                                                            className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-1 rounded"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </h2>
                                                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${userTeam.members.length >= 5 ? 'bg-red-500/80' : 'bg-indigo-500/50'}`}>
                                                    {userTeam.members.length}/5 Members
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Diversity Status</h3>
                                        {userTeam.members.length > 3 ? (() => {
                                            const diversity = checkDiversity(userTeam.members);
                                            return (
                                                <div className={`p-4 rounded-lg flex items-start gap-3 ${diversity.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                                                    <div className={`mt-0.5 ${diversity.valid ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                        {diversity.valid ? (
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${diversity.valid ? 'text-emerald-900' : 'text-amber-900'}`}>
                                                            {diversity.valid ? 'Rule Met: Team Validated!' : 'Rule Not Met: Need Diversity'}
                                                        </p>
                                                        <p className={`text-sm mt-1 ${diversity.valid ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                            Geographies: {diversity.geoCount} (Min 2) • Work Streams: {diversity.streamCount} (Min 2)
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })() : (
                                            <div className="p-4 rounded-lg flex items-start gap-3 bg-slate-50 border border-slate-200">
                                                <div className="mt-0.5 text-slate-400">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-600">Not Yet Applicable</p>
                                                    <p className="text-sm mt-1 text-slate-500">Diversity rule applies when team has more than 3 members ({userTeam.members.length}/3 currently).</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {userTeam.members.length >= 5 && (
                                        <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                            <p className="text-orange-700 text-sm font-semibold flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Team has reached maximum capacity (5/5 members).
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Roster</h3>
                                        <ul className="bg-slate-50/50 rounded-lg border border-slate-100 px-4 py-2">
                                            {renderMembers()}
                                        </ul>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 text-right">
                                        <button
                                            onClick={handleLeaveTeam}
                                            className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                                        >
                                            Leave Team
                                        </button>
                                        {isCaptain && userTeam.members.length > 1 && (
                                            <p className="text-xs text-amber-600 mt-2 font-medium">
                                                ⚠ You must transfer captaincy to another member before you can leave.
                                            </p>
                                        )}
                                        {isCaptain && userTeam.members.length === 1 && (
                                            <p className="text-xs text-slate-400 mt-2">
                                                You are the only member. Leaving will dissolve the team.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Requests Sidebar for Captains */}
                        {isCaptain && (
                            <div className="md:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase">Join Requests</h3>
                                        {userTeam.pendingRequests.length > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {userTeam.pendingRequests.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-0">
                                        {userTeam.pendingRequests.length === 0 ? (
                                            <p className="text-slate-500 text-sm p-6 text-center">No pending requests.</p>
                                        ) : (
                                            <ul className="divide-y divide-slate-100">
                                                {userTeam.pendingRequests.map(reqId => {
                                                    const u = users.find(user => user.id === reqId);
                                                    if (!u) return null;

                                                    const teamIsFull = userTeam.members.length >= 5;

                                                    return (
                                                        <li key={u.id} className="p-4 bg-white">
                                                            <div className="mb-3">
                                                                <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                                                                <p className="text-xs text-slate-500">{u.workStream} • {u.location}</p>
                                                            </div>
                                                            {teamIsFull ? (
                                                                <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 rounded text-center">
                                                                    Team has reached maximum capacity. Cannot approve.
                                                                </p>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleApprove(u.id)}
                                                                        className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded transition-colors"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(u.id)}
                                                                        className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded transition-colors"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Day-wise Points Table */}
                    {renderPointsTable()}
                </>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Create Team Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Create a Team</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Start a new team as Captain and invite colleagues. Remember the diversity rule: you&apos;ll need members from at least two regions and two work streams. Maximum 5 members per team.
                        </p>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g. Cloud Walkers"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team Logo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg border border-slate-300"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 2 * 1024 * 1024) {
                                            alert("Image too large (max 2MB)");
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setNewTeamLogo(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                />
                                {newTeamLogo && (
                                    <div className="mt-2 h-16 w-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={newTeamLogo} alt="Team logo preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform active:scale-[0.98] shadow-md"
                            >
                                Create & Become Captain
                            </button>
                        </form>
                    </div>

                    {/* Join Existing Team */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Join an Existing Team</h2>
                        {teams.length === 0 ? (
                            <p className="text-slate-500 text-sm">No teams have been created yet. Be the first!</p>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {teams.map(team => {
                                    const members = team.members || [];
                                    const pending = team.pendingRequests || [];
                                    const diversity = checkDiversity(members);
                                    const isPending = pending.includes(currentUser.id);
                                    const captain = users.find(u => u.id === team.captainId);
                                    const isFull = members.length >= 5;

                                    return (
                                        <div key={team.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors bg-slate-50 hover:bg-white flex flex-col justify-between h-full gap-4">
                                            <div>
                                                <div className="flex justify-between items-start mb-2 gap-3">
                                                    <div className="flex items-center gap-3">
                                                        {team.brandImageUrl ? (
                                                            <img src={team.brandImageUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-slate-200" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-indigo-100 text-indigo-500 font-bold rounded-lg flex items-center justify-center shrink-0 border border-indigo-200">
                                                                {team.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <h3 className="font-bold text-slate-900">{team.name}</h3>
                                                    </div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isFull ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                        {members.length}/5
                                                    </span>
                                                </div>
                                                {captain && (
                                                    <p className="text-xs text-slate-600 mb-2 font-medium">Captained by {captain.name}</p>
                                                )}
                                                <div className="text-xs text-slate-500">
                                                    {members.length > 3 ? (
                                                        <>
                                                            <span className={diversity.valid ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                                                                {diversity.valid ? '✓ Diverse' : '⚠ Needs Diversity'}
                                                            </span>
                                                            <span className="mx-2">•</span>
                                                            {diversity.geoCount} Geo, {diversity.streamCount} Stream
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">Diversity rule applies at 4+ members</span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleJoinTeam(team.id)}
                                                disabled={isFull || isPending}
                                                className={`w-full py-2 px-3 border text-sm font-bold rounded-lg transition-colors ${isPending
                                                    ? 'bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed'
                                                    : isFull
                                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                                        : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm'
                                                    }`}
                                            >
                                                {isPending
                                                    ? 'Pending Approval'
                                                    : isFull
                                                        ? 'Team Full (Max 5)'
                                                        : 'Request to Join'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
