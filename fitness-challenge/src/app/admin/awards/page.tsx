'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { AwardWeek } from '@/types';

const AWARD_WEEKS: AwardWeek[] = ['Week 1', 'Week 2', 'Week 3', 'Overall'];

const PRESET_CATEGORIES = [
  { name: 'Top Team', type: 'team' as const, icon: '🏆', desc: 'Highest total team points' },
  { name: 'Runner-Up Team', type: 'team' as const, icon: '🥈', desc: 'Second highest team points' },
  { name: 'Second Runner-Up Team', type: 'team' as const, icon: '🥉', desc: 'Third highest team points' },
  { name: 'Most Active Individual', type: 'individual' as const, icon: '🔥', desc: 'Individual with highest activity points' },
  { name: 'Step Champion', type: 'individual' as const, icon: '👟', desc: 'Individual with highest step count' },
  { name: 'Consistency King', type: 'individual' as const, icon: '👑', desc: 'Most consistent daily logger' },
  { name: 'Weekend Warrior', type: 'team' as const, icon: '⭐', desc: 'Best weekend challenge performance' },
  { name: 'Diversity Champion', type: 'team' as const, icon: '🌍', desc: 'Best diversity representation' },
  { name: 'Spirit Award', type: 'team' as const, icon: '💫', desc: 'Most engaged & supportive team' },
  { name: 'Zen Master', type: 'individual' as const, icon: '🧘', desc: 'Highest wellness/mindfulness activity' },
  { name: 'Power Player', type: 'individual' as const, icon: '💪', desc: 'Most strength training points' },
];

export default function AdminAwardsPage() {
  const router = useRouter();
  const { currentUser, users, teams, awards, addAward, removeAward } = useAppContext();

  const [selectedWeek, setSelectedWeek] = useState<AwardWeek>('Week 1');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [winnerType, setWinnerType] = useState<'team' | 'individual'>('team');
  const [winnerId, setWinnerId] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') router.push('/');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'admin') return null;

  // When a preset category is selected, auto-set the winner type
  const handlePresetCategory = (preset: typeof PRESET_CATEGORIES[0]) => {
    setCategory(preset.name);
    setCustomCategory('');
    setWinnerType(preset.type);
    setDescription(preset.desc);
  };

  const effectiveCategory = customCategory.trim() || category;

  const winnerName = winnerType === 'team'
    ? teams.find(t => t.id === winnerId)?.name || ''
    : users.find(u => u.id === winnerId)?.name || '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!effectiveCategory) {
      setErrorMsg('Please select or enter an award category.');
      return;
    }
    if (!winnerId) {
      setErrorMsg('Please select a winner.');
      return;
    }

    addAward({
      week: selectedWeek,
      category: effectiveCategory,
      winnerType,
      winnerId,
      winnerName,
      description: description.trim() || undefined,
      points: points ? parseInt(points) : undefined,
      announcedAt: new Date().toISOString(),
    });

    setSuccessMsg(`🏆 "${effectiveCategory}" award for ${selectedWeek} given to ${winnerName}!`);
    setCategory('');
    setCustomCategory('');
    setWinnerId('');
    setDescription('');
    setPoints('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Group existing awards by week
  const awardsByWeek = AWARD_WEEKS.map(wk => ({
    week: wk,
    awards: awards.filter(a => a.week === wk),
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Manage Awards
        </h1>
        <p className="text-slate-500 mt-1">Declare weekly winners for the Hall of Fame. Awards appear publicly.</p>
      </header>

      {/* ════════════════════════════════════════════
          DECLARE AWARD FORM
         ════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏅</span> Declare New Award
          </h2>
        </div>

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md text-red-700 text-sm font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-md text-emerald-700 text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Week selector */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Award Period</label>
              <div className="flex gap-2 flex-wrap">
                {AWARD_WEEKS.map(wk => (
                  <button
                    key={wk}
                    type="button"
                    onClick={() => setSelectedWeek(wk)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedWeek === wk
                      ? wk === 'Overall'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                        : 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {wk === 'Overall' ? '🏆 Overall' : `📅 ${wk}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selector — preset pills + custom */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Award Category</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {PRESET_CATEGORIES.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetCategory(preset)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === preset.name && !customCategory
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={preset.desc}
                  >
                    <span>{preset.icon}</span>
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or enter a custom category..."
                value={customCategory}
                onChange={(e) => { setCustomCategory(e.target.value); if (e.target.value) setCategory(''); }}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>

            {/* Winner type toggle + winner selector */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Winner Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setWinnerType('team'); setWinnerId(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${winnerType === 'team'
                      ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🏅 Team
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWinnerType('individual'); setWinnerId(''); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${winnerType === 'individual'
                      ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🧑 Individual
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Select {winnerType === 'team' ? 'Team' : 'Individual'}
                </label>
                <select
                  value={winnerId}
                  onChange={(e) => setWinnerId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                >
                  <option value="">-- Choose --</option>
                  {winnerType === 'team'
                    ? teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                    : users.filter(u => u.role !== 'admin').map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.workStream} · {u.location})</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Points + Description */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Points (optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 450"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dominated all 7 days!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
            </div>

            {/* Preview + Submit */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                {effectiveCategory && winnerId ? (
                  <span>
                    <strong className="text-slate-800">{effectiveCategory}</strong> → <strong className="text-indigo-600">{winnerName}</strong> ({selectedWeek})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Fill in the form to preview...</span>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600 transition-all active:scale-[0.97]"
              >
                🏆 Announce Award
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          EXISTING AWARDS — grouped by week
         ════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            📋 Declared Awards
            <span className="text-sm font-normal text-slate-400">({awards.length} total)</span>
          </h2>
        </div>

        {awards.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <svg className="w-14 h-14 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <p className="text-sm">No awards declared yet. Use the form above to announce winners.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {awardsByWeek.filter(g => g.awards.length > 0).map(group => (
              <div key={group.week} className="p-6">
                <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${group.week === 'Overall' ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {group.week === 'Overall' ? '🏆 Overall Winners' : `📅 ${group.week} Winners`}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {group.awards.map(award => {
                    const catPreset = PRESET_CATEGORIES.find(c => c.name === award.category);
                    return (
                      <div key={award.id} className="flex items-start justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{catPreset?.icon || '🏅'}</span>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{award.category}</div>
                            <div className="text-indigo-600 font-semibold text-sm mt-0.5">
                              {award.winnerType === 'team' ? '🏅' : '🧑'} {award.winnerName}
                            </div>
                            {award.points != null && (
                              <div className="text-xs text-slate-500 mt-0.5">{award.points.toLocaleString()} pts</div>
                            )}
                            {award.description && (
                              <div className="text-xs text-slate-400 mt-1 italic">&ldquo;{award.description}&rdquo;</div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${award.category}" award for ${award.winnerName}?`)) {
                              removeAward(award.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors shrink-0 mt-1"
                          title="Remove award"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
