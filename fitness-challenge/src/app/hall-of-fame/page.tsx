'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { AwardWeek } from '@/types';

const WEEK_TABS: { key: AwardWeek; label: string; icon: string; gradient: string }[] = [
  { key: 'Week 1', label: 'Week 1', icon: '📅', gradient: 'from-blue-500 to-cyan-500' },
  { key: 'Week 2', label: 'Week 2', icon: '📅', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'Week 3', label: 'Week 3', icon: '📅', gradient: 'from-purple-500 to-pink-500' },
  { key: 'Overall', label: 'Overall Champions', icon: '🏆', gradient: 'from-amber-500 to-orange-500' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Top Team': '🏆',
  'Runner-Up Team': '🥈',
  'Second Runner-Up Team': '🥉',
  'Most Active Individual': '🔥',
  'Step Champion': '👟',
  'Consistency King': '👑',
  'Weekend Warrior': '⭐',
  'Diversity Champion': '🌍',
  'Spirit Award': '💫',
  'Zen Master': '🧘',
  'Power Player': '💪',
};

function getRankGradient(index: number) {
  if (index === 0) return 'from-amber-400 via-yellow-300 to-amber-500'; // Gold
  if (index === 1) return 'from-slate-300 via-slate-200 to-slate-400'; // Silver
  if (index === 2) return 'from-amber-600 via-amber-500 to-amber-700'; // Bronze
  return 'from-indigo-400 to-purple-500';
}

function getRankBorder(index: number) {
  if (index === 0) return 'border-amber-400 shadow-amber-200/50';
  if (index === 1) return 'border-slate-300 shadow-slate-200/50';
  if (index === 2) return 'border-amber-600 shadow-amber-300/50';
  return 'border-indigo-300 shadow-indigo-100/50';
}

export default function HallOfFamePage() {
  const { awards, teams, users } = useAppContext();
  const [activeTab, setActiveTab] = useState<AwardWeek>('Overall');

  // Find the latest tab that has awards, or default to Overall
  const firstTabWithAwards = [...WEEK_TABS].reverse().find(t => awards.some(a => a.week === t.key));

  // Use user selection or auto-detect
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const effectiveTab = hasManuallySelected ? activeTab : (firstTabWithAwards?.key || 'Overall');
  const currentAwards = awards.filter(a => a.week === effectiveTab);

  // Stats
  const totalAwards = awards.length;
  const weeksAnnounced = new Set(awards.map(a => a.week)).size;
  const teamsAwarded = new Set(awards.filter(a => a.winnerType === 'team').map(a => a.winnerId)).size;
  const individualsAwarded = new Set(awards.filter(a => a.winnerType === 'individual').map(a => a.winnerId)).size;

  // Separate team & individual awards for current tab
  const teamAwards = currentAwards.filter(a => a.winnerType === 'team');
  const individualAwards = currentAwards.filter(a => a.winnerType === 'individual');

  const noAwardsYet = awards.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ═══════════════════════════════════════════════
          HERO HEADER
         ═══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-900 rounded-2xl shadow-lg px-8 py-10 md:py-14">
        {/* Decorative sparkle effects */}
        <div className="absolute top-5 left-10 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        <div className="absolute top-12 right-20 w-3 h-3 bg-yellow-300 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-8 left-1/4 w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-4 right-12 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse delay-1000" />

        <div className="relative z-10 text-center">
          <div className="text-5xl md:text-6xl mb-4">🏆</div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-indigo-200 text-sm md:text-base mt-2 max-w-md mx-auto">
            Celebrating the champions of the Wellbeing Challenge &apos;26. Weekly winners and overall champions.
          </p>

          {/* Quick stats */}
          {!noAwardsYet && (
            <div className="flex justify-center gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{totalAwards}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Awards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{weeksAnnounced}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{teamsAwarded}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400">{individualsAwarded}</div>
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">Individuals</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          EMPTY STATE
         ═══════════════════════════════════════════════ */}
      {noAwardsYet ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">🏅</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Awards Announced Yet</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Winners will be announced weekly throughout the 4-week challenge. Check back soon!
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            {WEEK_TABS.map(tab => (
              <div key={tab.key} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <span>{tab.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-700">{tab.label}</div>
                  <div className="text-[10px] text-slate-400">
                    {tab.key === 'Overall' ? 'End of Week 4' : `After ${tab.key}`}
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">PENDING</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════
              WEEK TABS
             ═══════════════════════════════════════════════ */}
          <div className="flex gap-2 flex-wrap">
            {WEEK_TABS.map(tab => {
              const tabAwards = awards.filter(a => a.week === tab.key);
              const isActive = effectiveTab === tab.key;
              const hasAwards = tabAwards.length > 0;

              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setHasManuallySelected(true); }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-[1.02]`
                      : hasAwards
                        ? 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-default'
                  }`}
                  disabled={!hasAwards && !isActive}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {hasAwards && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {tabAwards.length}
                    </span>
                  )}
                  {!hasAwards && (
                    <span className="text-[9px] font-bold bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-full">TBD</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ═══════════════════════════════════════════════
              CURRENT TAB AWARDS
             ═══════════════════════════════════════════════ */}
          {currentAwards.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">{effectiveTab} Awards Coming Soon</h3>
              <p className="text-sm text-slate-500">Winners for this period haven&apos;t been announced yet. Stay tuned!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* TEAM AWARDS */}
              {teamAwards.length > 0 && (
                <div>
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-indigo-400 rounded-full" />
                    Team Awards
                    <span className="w-8 h-0.5 bg-indigo-400 rounded-full" />
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2">
                    {teamAwards.map((award, idx) => {
                      const team = teams.find(t => t.id === award.winnerId);
                      const icon = CATEGORY_ICONS[award.category] || '🏅';
                      const members = team ? team.members.map(mid => users.find(u => u.id === mid)).filter(Boolean) : [];

                      return (
                        <div
                          key={award.id}
                          className={`relative overflow-hidden bg-white rounded-2xl border-2 ${getRankBorder(idx)} shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        >
                          {/* Top gradient stripe */}
                          <div className={`h-1.5 bg-gradient-to-r ${getRankGradient(idx)}`} />

                          <div className="p-6">
                            {/* Award badge + category */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRankGradient(idx)} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                                  {icon}
                                </div>
                                <div>
                                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{award.category}</div>
                                  <div className="text-xl font-black text-slate-900 mt-0.5">{award.winnerName}</div>
                                </div>
                              </div>
                              {award.points != null && (
                                <div className="text-right">
                                  <div className="text-lg font-black text-indigo-600">{award.points.toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">Points</div>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {award.description && (
                              <p className="text-sm text-slate-500 italic mb-4 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                &ldquo;{award.description}&rdquo;
                              </p>
                            )}

                            {/* Team members */}
                            {members.length > 0 && (
                              <div className="flex items-center gap-1 mt-3">
                                <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Members:</span>
                                <div className="flex -space-x-2">
                                  {members.slice(0, 4).map(m => m && (
                                    <div
                                      key={m.id}
                                      className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm"
                                      title={m.name}
                                    >
                                      {m.name.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-400 ml-2">{members.map(m => m?.name.split(' ')[0]).join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INDIVIDUAL AWARDS */}
              {individualAwards.length > 0 && (
                <div>
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
                    Individual Awards
                    <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {individualAwards.map((award, idx) => {
                      const user = users.find(u => u.id === award.winnerId);
                      const icon = CATEGORY_ICONS[award.category] || '🏅';
                      const team = user?.teamId ? teams.find(t => t.id === user.teamId) : null;

                      return (
                        <div
                          key={award.id}
                          className={`relative overflow-hidden bg-white rounded-2xl border-2 ${getRankBorder(idx)} shadow-lg hover:shadow-xl transition-all duration-300 group`}
                        >
                          <div className={`h-1.5 bg-gradient-to-r ${getRankGradient(idx)}`} />

                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getRankGradient(idx)} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{award.category}</div>
                                <div className="text-lg font-black text-slate-900 truncate">{award.winnerName}</div>
                              </div>
                            </div>

                            {/* User details */}
                            {user && (
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{user.workStream}</span>
                                <span>·</span>
                                <span>{user.location}</span>
                                {team && (
                                  <>
                                    <span>·</span>
                                    <span className="text-indigo-500 font-semibold">{team.name}</span>
                                  </>
                                )}
                              </div>
                            )}

                            {award.points != null && (
                              <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-sm font-black mt-1">
                                {award.points.toLocaleString()} <span className="text-xs font-medium">pts</span>
                              </div>
                            )}

                            {award.description && (
                              <p className="text-xs text-slate-400 italic mt-3">
                                &ldquo;{award.description}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════
          TIMELINE — shows all weeks at a glance
         ═══════════════════════════════════════════════ */}
      {!noAwardsYet && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6 text-center">
            🗓️ Challenge Timeline
          </h2>
          <div className="flex items-center justify-center gap-0">
            {WEEK_TABS.map((tab, i) => {
              const weekAwards = awards.filter(a => a.week === tab.key);
              const hasData = weekAwards.length > 0;
              const isOverall = tab.key === 'Overall';

              return (
                <React.Fragment key={tab.key}>
                  {/* Timeline node */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => { setActiveTab(tab.key); setHasManuallySelected(true); }}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
                        hasData
                          ? isOverall
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200/50 hover:scale-110'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200/50 hover:scale-110'
                          : 'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200'
                      }`}
                    >
                      {hasData ? tab.icon : '⏳'}
                    </button>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-bold ${hasData ? 'text-slate-800' : 'text-slate-400'}`}>{tab.label}</div>
                      <div className={`text-[10px] ${hasData ? 'text-indigo-500 font-bold' : 'text-slate-300'}`}>
                        {hasData ? `${weekAwards.length} awards` : 'Pending'}
                      </div>
                    </div>
                  </div>
                  {/* Connector line */}
                  {i < WEEK_TABS.length - 1 && (
                    <div className={`w-12 md:w-20 h-0.5 mx-1 mt-[-24px] rounded-full ${
                      hasData && awards.some(a => a.week === WEEK_TABS[i + 1].key)
                        ? 'bg-gradient-to-r from-indigo-400 to-purple-400'
                        : hasData
                          ? 'bg-gradient-to-r from-indigo-400 to-slate-200'
                          : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
