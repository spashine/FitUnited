'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { WeekendChallenge } from '@/types';

export default function AdminWeekendChallenges() {
    const {
        currentUser, weekendChallenges, setWeekendChallengeVisibility,
        teams, teamBonusPoints, awardTeamBonusPoint, removeTeamBonusPoint, updateWeekendChallenge,
        posts, users
    } = useAppContext();

    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedChallenge, setSelectedChallenge] = useState('');
    const [bonusPoints, setBonusPoints] = useState('');

    const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<WeekendChallenge>>({});

    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex justify-center py-20">
                <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200">
                    Access Denied. Admin privileges required.
                </div>
            </div>
        );
    }

    const handleAwardPoints = (e: React.FormEvent) => {
        e.preventDefault();
        const pts = parseInt(bonusPoints, 10);
        if (!selectedTeam || !selectedChallenge || isNaN(pts)) return;

        awardTeamBonusPoint({
            teamId: selectedTeam,
            challengeId: selectedChallenge,
            points: pts,
            dateStr: new Date().toISOString().split('T')[0]
        });

        setBonusPoints('');
        // Keep selections to make bulk awarding easier
    };

    const handleEditSave = (id: string) => {
        updateWeekendChallenge(id, editForm);
        setEditingChallengeId(null);
        setEditForm({});
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Manage Weekend Challenges
                </h1>
                <p className="text-slate-500 mt-1">Activate challenges and award team bonus points directly.</p>
            </div>

            {/* Weekend Challenges List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-bold text-slate-800">Challenges</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {weekendChallenges.map(challenge => (
                        <div key={challenge.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${challenge.isVisible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {challenge.weekNo}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900">{challenge.name}</h3>
                                        {challenge.isVisible && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                Active Now
                                            </span>
                                        )}
                                    </div>

                                    {editingChallengeId === challenge.id ? (
                                        <div className="mt-3 space-y-3 p-4 bg-white border border-slate-200 rounded-xl">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Name</label>
                                                <input type="text" className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-sm" value={editForm.name ?? challenge.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Description</label>
                                                <textarea className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-sm h-20" value={editForm.description ?? challenge.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}></textarea>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">Bonus Points Desc</label>
                                                <input type="text" className="w-full mt-1 border border-slate-300 rounded px-2 py-1 text-sm" value={editForm.bonusPointsDesc ?? challenge.bonusPointsDesc} onChange={e => setEditForm(prev => ({ ...prev, bonusPointsDesc: e.target.value }))} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEditSave(challenge.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700">Save</button>
                                                <button onClick={() => setEditingChallengeId(null)} className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-600 mt-1">{challenge.description}</p>
                                            <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {challenge.bonusPointsDesc}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {!challenge.isVisible ? (
                                        <button
                                            onClick={() => setWeekendChallengeVisibility(challenge.id, true)}
                                            className="w-full bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                        >
                                            Mark Active
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setWeekendChallengeVisibility(challenge.id, false)}
                                            className="w-full bg-slate-100 text-slate-500 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Hide
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setEditingChallengeId(challenge.id); setEditForm({}); }}
                                        className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekend Challenge Submissions Review Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-bold text-slate-800">Recent Challenge Submissions (Social Wall)</h2>
                    <p className="text-sm text-slate-500">Review posts tagged with a weekend challenge. You can easily select the team below to award points.</p>
                </div>
                <div className="p-0 max-h-96 overflow-y-auto">
                    {posts.filter(p => p.weekendChallengeId).length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No tagged posts yet.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {posts.filter(p => p.weekendChallengeId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 20).map(post => {
                                const postUser = users.find(u => u.id === post.userId);
                                const postTeam = postUser?.teamId ? teams.find(t => t.id === postUser.teamId) : null;
                                const challenge = weekendChallenges.find(c => c.id === post.weekendChallengeId);

                                return (
                                    <div key={post.id} className="p-6 hover:bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-slate-900">{postUser?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Team: <span className="font-semibold">{postTeam?.name || 'No Team'}</span></p>
                                            </div>
                                            <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-purple-200">
                                                {challenge?.name || 'Unknown Challenge'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 mt-3">{post.content}</p>

                                        {post.mediaUrl && (
                                            <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 inline-block">
                                                <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 p-2 block bg-indigo-50 font-medium">
                                                    View Attached Media / Link
                                                </a>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    if (postTeam && post.weekendChallengeId) {
                                                        setSelectedTeam(postTeam.id);
                                                        setSelectedChallenge(post.weekendChallengeId);
                                                        // Smooth scroll to the Award Points section
                                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                                    }
                                                }}
                                                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
                                            >
                                                Prepare Award for {postTeam?.name || 'this Team'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Award Points Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Award Team Bonus Points
                </h2>

                <form onSubmit={handleAwardPoints} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-indigo-200 mb-1.5">Select Team</label>
                        <select
                            value={selectedTeam}
                            onChange={e => setSelectedTeam(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            required
                        >
                            <option value="" className="text-slate-800">Select...</option>
                            {teams.map(t => <option key={t.id} value={t.id} className="text-slate-800">{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-indigo-200 mb-1.5">For Challenge</label>
                        <select
                            value={selectedChallenge}
                            onChange={e => setSelectedChallenge(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            required
                        >
                            <option value="" className="text-slate-800">Select...</option>
                            {weekendChallenges.map(c => <option key={c.id} value={c.id} className="text-slate-800">{c.weekNo}: {c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-indigo-200 mb-1.5">Points to Award</label>
                        <input
                            type="number"
                            min="1"
                            value={bonusPoints}
                            onChange={e => setBonusPoints(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-white/30"
                            placeholder="+50"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-lg px-4 py-2.5 shadow-lg transition-colors flex items-center justify-center gap-2">
                        Award Points
                    </button>
                </form>
            </div>

            {/* Awarded Points History */}
            {teamBonusPoints.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-bold text-slate-800">Recent Bonus Awards</h2>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Team</th>
                                <th className="px-6 py-3 font-semibold">Challenge</th>
                                <th className="px-6 py-3 font-semibold text-right">Points</th>
                                <th className="px-6 py-3 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...teamBonusPoints].reverse().map(award => {
                                const team = teams.find(t => t.id === award.teamId);
                                const chal = weekendChallenges.find(c => c.id === award.challengeId);
                                return (
                                    <tr key={award.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{award.dateStr}</td>
                                        <td className="px-6 py-3 font-bold text-indigo-900">{team?.name || 'Unknown Team'}</td>
                                        <td className="px-6 py-3 text-slate-600">{chal?.name || 'Unknown'}</td>
                                        <td className="px-6 py-3 text-right">
                                            <span className="inline-block bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-xs">
                                                +{award.points}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => removeTeamBonusPoint(award.id)}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                            >
                                                Revoke
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
