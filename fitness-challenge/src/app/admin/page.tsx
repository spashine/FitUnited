'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { generateMockId } from '@/hooks/useLocalStorage';
import { User } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, users, teams, activities, isWeekendChallengePublished, toggleWeekendChallenge } = useAppContext();

  // Note: For simplicity in this demo, we assume any logged-in user can view the admin dashboard,
  // or we could enforce a specific admin role. Sticking to simple redirect if not logged in.
  if (!currentUser || currentUser.role !== 'admin') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  // Calculate generic participation stats
  const totalEmployees = 132; // Given in requirements
  const activeUsers = new Set(activities.map(a => a.userId)).size;
  const participationRate = Math.round((activeUsers / totalEmployees) * 100);

  // Calculate location stats for Heatmap
  const US_Count = users.filter(u => u.location === 'US').length;
  const Mexico_Count = users.filter(u => u.location === 'Mexico').length;
  const India_Count = users.filter(u => u.location === 'India').length;

  const US_Points = activities.filter(a => users.find(u => u.id === a.userId)?.location === 'US').reduce((sum, a) => sum + a.points, 0);
  const Mexico_Points = activities.filter(a => users.find(u => u.id === a.userId)?.location === 'Mexico').reduce((sum, a) => sum + a.points, 0);
  const India_Points = activities.filter(a => users.find(u => u.id === a.userId)?.location === 'India').reduce((sum, a) => sum + a.points, 0);

  // Leaderboard Calculations
  // Requirements: 
  // Individual Score: Sum(Activity_Points) capped at 100/day. (Already enforced on log)
  // Team Sync Bonus: +50 pts if all members log activity on the same day. 
  // For the mockup, we will calculate the base sum of member scores.

  const getTeamScore = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return 0;

    // Sum all member points
    const basePoints = activities
      .filter(a => team.members.includes(a.userId))
      .reduce((sum, a) => sum + a.points, 0);

    // Stub for sync bonus logic:
    // Determine unique dates where ALL team members have at least 1 log
    const memberLogsByDate: Record<string, Set<string>> = {};
    activities.forEach(a => {
      if (team.members.includes(a.userId)) {
        if (!memberLogsByDate[a.date]) memberLogsByDate[a.date] = new Set();
        memberLogsByDate[a.date].add(a.userId);
      }
    });

    let syncBonuses = 0;
    // Only apply if team size > 1 (a team of 1 "syncs" every day they log, which is maybe cheating)
    if (team.members.length > 1) {
      Object.values(memberLogsByDate).forEach(memberSet => {
        if (memberSet.size === team.members.length) {
          syncBonuses += 50;
        }
      });
    }

    return basePoints + syncBonuses;
  };

  const sortedTeams = [...teams].map(t => ({ ...t, score: getTeamScore(t.id) })).sort((a, b) => b.score - a.score);

  const handleNudge = () => {
    alert("Nudge emails sent to users inactive for 48 hours!");
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Rank,Team Name,Score\\n"
      + sortedTeams.map((t, idx) => `${idx+1},${t.name},${t.score}`).join("\\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "global_fitness_standings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Dashboard</h1>
          <p className="text-slate-500 mt-1">Admin view for analytics and management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-sm font-semibold text-slate-700">Weekend Challenge:</span>
            <button
              onClick={() => toggleWeekendChallenge(!isWeekendChallengePublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isWeekendChallengePublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isWeekendChallengePublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-bold uppercase ${isWeekendChallengePublished ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isWeekendChallengePublished ? 'Live' : 'Hidden'}
            </span>
          </div>
          <button onClick={handleNudge} className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-lg hover:bg-amber-200 transition-colors">
            Nudge Inactive
          </button>
          <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Export Standings
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Participation Rate</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">{participationRate}%</span>
            <span className="text-slate-400 font-medium mb-1">({activeUsers}/{totalEmployees})</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${participationRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Points</h3>
          <div className="text-4xl font-black text-emerald-600">
            {activities.reduce((sum, a) => sum + a.points, 0).toLocaleString()} <span className="text-lg text-emerald-400 ml-1">pts</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Registered Teams</h3>
          <div className="text-4xl font-black text-indigo-600">
            {teams.length} <span className="text-lg text-indigo-400 ml-1">teams</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">Team Leaderboard</h2>
          </div>
          <div className="p-0">
            {sortedTeams.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">No teams created yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {sortedTeams.map((team, index) => (
                  <li key={team.id} className={`px-6 py-4 flex items-center justify-between ${index === 0 ? 'bg-amber-50/50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-amber-400 text-amber-900' : 
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-bold ${index === 0 ? 'text-amber-900' : 'text-slate-900'}`}>{team.name}</p>
                        <p className="text-xs text-slate-500">{team.members.length} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-600">{team.score}</p>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Points</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Heatmap & Upload */}
        <div className="space-y-8">
          {/* Location Heatmap (Mocked data viz) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Location Heatmap</h2>
            <div className="space-y-5">
              {/* US */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-semibold text-slate-700">United States ({US_Count} users)</span>
                  <span className="text-indigo-600 font-bold">{US_Points} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (US_Points / (US_Points+Mexico_Points+India_Points+1)) * 100))}%` }}></div>
                </div>
              </div>

              {/* India */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-semibold text-slate-700">India ({India_Count} users)</span>
                  <span className="text-indigo-600 font-bold">{India_Points} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (India_Points / (US_Points+Mexico_Points+India_Points+1)) * 100))}%` }}></div>
                </div>
              </div>

              {/* Mexico */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-semibold text-slate-700">Mexico ({Mexico_Count} users)</span>
                  <span className="text-indigo-600 font-bold">{Mexico_Points} pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${Math.min(100, Math.max(5, (Mexico_Points / (US_Points+Mexico_Points+India_Points+1)) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* CSV Upload */}
          <div className="bg-slate-50 p-6 rounded-2xl shadow-inner border border-slate-200 border-dashed text-center">
            <h3 className="font-bold text-slate-700 mb-2">Participant Roster Upload</h3>
            <p className="text-sm text-slate-500 mb-4">Upload the initial 132 employee CSV to populate the system directory.</p>
            <label className="inline-block px-6 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
              <span>Select CSV File</span>
              <input type="file" className="hidden" accept=".csv" onChange={() => alert("CSV Upload simulated successfully!")} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
