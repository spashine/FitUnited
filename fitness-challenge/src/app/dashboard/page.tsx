'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { ActivityLog } from '@/types';

const ACTIVITY_CATEGORIES = [
  { id: 'Sports', name: 'Sports', desc: 'Cricket, Golf, Pickleball, Tennis, Football', ptsPerSlot: 20, slotMins: 60, color: 'bg-amber-500', icon: '🏏', isAchievement: false },
  { id: 'Movement', name: 'Movement', desc: 'Walking, Running, Cycling, Swimming', ptsPerSlot: 10, slotMins: 30, color: 'bg-emerald-500', icon: '🚶', isAchievement: false },
  { id: 'Power', name: 'Power', desc: 'Weightlifting, HIIT, CrossFit', ptsPerSlot: 20, slotMins: 30, color: 'bg-rose-500', icon: '💪', isAchievement: false },
  { id: 'Flow', name: 'Flow', desc: 'Yoga, Pilates, Stretching', ptsPerSlot: 15, slotMins: 30, color: 'bg-cyan-500', icon: '🧘', isAchievement: false },
  { id: 'Zen', name: 'Zen', desc: 'Meditation, 7+ hrs Sleep, Hydration', ptsPerSlot: 5, slotMins: 0, color: 'bg-indigo-400', icon: '🧠', isAchievement: true }
] as const;

function calculatePoints(categoryId: string, durationMins: number): number {
  const cat = ACTIVITY_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return 0;
  // Achievement-based (Zen): return fixed points
  if (cat.isAchievement || (cat.slotMins as number) === 0) return cat.ptsPerSlot;
  // Duration-based: calculate from time slots
  const slots = Math.floor(durationMins / cat.slotMins);
  return slots * cat.ptsPerSlot;
}

/** Get Monday of the week containing `d` */
function getWeekMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sun=0 → go back 6
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function fmtISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

function fmtDateFriendly(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const todayStr = fmtISO(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = fmtISO(yesterdayDate);
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, activities, logActivity, weekendChallenges } = useAppContext();

  const today = new Date();
  const todayStr = fmtISO(today);
  const monday = getWeekMonday(today);
  const mondayStr = fmtISO(monday);

  const [date, setDate] = useState(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<ActivityLog['category']>('Movement');
  const [duration, setDuration] = useState<number>(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Protect route
  useEffect(() => {
    if (!currentUser) router.push('/');
  }, [currentUser, router]);


  // ────── Points for selected date ──────
  const selectedDateActivities = activities.filter(a => a.userId === currentUser?.id && a.date === date);
  const selectedDateRegular = selectedDateActivities.filter(a => !a.isWeekendChallenge);
  const selectedDatePoints = selectedDateRegular.reduce((sum, a) => sum + a.points, 0);

  const estimatedPoints = calculatePoints(selectedCategory, duration);
  const remainingCap = Math.max(0, 100 - selectedDatePoints);
  const effectivePoints = Math.min(estimatedPoints, remainingCap);

  // ────── All user activities sorted by date (most recent first) ──────
  const allMyActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities
      .filter(a => a.userId === currentUser.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activities, currentUser]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, ActivityLog[]>();
    allMyActivities.forEach(a => {
      const arr = map.get(a.date) || [];
      arr.push(a);
      map.set(a.date, arr);
    });
    return Array.from(map.entries()); // [date, logs][]
  }, [allMyActivities]);

  // ────── Date validation ──────
  const handleDateChange = (val: string) => {
    const chosen = new Date(val + 'T00:00:00');
    // Must be in current week (Mon–Sun) and not future
    if (chosen > today) {
      setErrorMsg('Cannot log activities for a future date.');
      return;
    }
    if (chosen < monday) {
      setErrorMsg('Can only log activities for the current week (Monday to Sunday).');
      return;
    }
    setErrorMsg('');
    setDate(val);
  };

  const selectedCatDef = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
  const isAchievementBased = selectedCatDef?.isAchievement ?? false;

  // ────── Submit handler ──────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isAchievementBased && duration <= 0) {
      setErrorMsg('Please enter a valid duration (minimum 1 minute).');
      return;
    }

    const pts = calculatePoints(selectedCategory, duration);
    if (pts <= 0) {
      const cat = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
      setErrorMsg(`Minimum ${cat?.slotMins || 30} minutes required to score points for ${selectedCategory}.`);
      return;
    }

    const result = logActivity({
      date,
      category: selectedCategory,
      points: pts,
      ...(isAchievementBased ? {} : { duration }),
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Error logging activity');
    } else {
      const catDef = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
      const logLabel = isAchievementBased
        ? `${catDef?.name} achievement`
        : `${duration} mins of ${catDef?.name}`;
      setSuccessMsg(`Logged ${logLabel} for ${fmtDateFriendly(date)} → +${Math.min(pts, remainingCap)} pts!`);
      if (!isAchievementBased) setDuration(30);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };


  // ────── Quick-pick day buttons for current week ──────
  const weekDays: { label: string; dateStr: string; dayName: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d > today) break; // don't show future days
    const iso = fmtISO(d);
    weekDays.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateStr: iso,
      dayName: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }

  if (!currentUser) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Activity</h1>
          <p className="text-slate-500 mt-1">Log your activities &amp; earn points for your team.</p>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          COMPACT ACTIVITY LOGGING FORM
         ═══════════════════════════════════════════════ */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        {/* Header row with title + daily cap */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Log Activity
          </h2>
          <div className="flex items-center gap-2">
            <div className="text-right leading-tight">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cap</div>
              <div className="text-sm font-black text-indigo-600">
                {selectedDatePoints}<span className="text-slate-300">/100</span>
              </div>
            </div>
            {selectedDatePoints >= 100 && (
              <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">MAX</span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-md text-red-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-3 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-md text-emerald-700 text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Row 1: Date dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-10 shrink-0">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={mondayStr}
              max={todayStr}
              className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 font-medium focus:ring-1 focus:ring-indigo-400 outline-none"
            />
          </div>

          {/* Row 2: Activity type — emoji pill buttons */}
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-10 shrink-0 mt-2">Type</span>
            <div className="flex gap-1.5 flex-wrap flex-1">
              {ACTIVITY_CATEGORIES.filter(cat => !cat.id.startsWith('Weekend')).map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as ActivityLog['category'])}
                    className={`flex flex-col items-start px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className={`text-[9px] px-1 py-0.5 rounded ${isSelected ? 'bg-indigo-500 text-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
                        {cat.isAchievement ? `${cat.ptsPerSlot}/act` : `${cat.ptsPerSlot}/${cat.slotMins}m`}
                      </span>
                    </div>
                    <span className={`text-[10px] font-normal mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Duration / Achievement + Submit */}
          <div className="flex items-center gap-2 flex-wrap">
            {isAchievementBased ? (
              <>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-10 shrink-0">Earn</span>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  +{selectedCatDef?.ptsPerSlot} pts per achievement
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-10 shrink-0">Time</span>
                <div className="flex gap-1 flex-wrap">
                  {[15, 30, 45, 60, 90, 120].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDuration(mins)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${duration === mins
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                      {formatDuration(mins)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="480"
                    required
                    value={duration}
                    onChange={(e) => setDuration(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1 border border-slate-200 rounded-md text-center font-bold text-sm focus:ring-1 focus:ring-indigo-400 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">min</span>
                </div>
              </>
            )}

            {/* Points preview + Submit inline */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="text-right leading-tight">
                <span className="text-sm font-black text-indigo-600">+{estimatedPoints} pts</span>
                {estimatedPoints > remainingCap && remainingCap > 0 && (
                  <div className="text-[9px] text-amber-500 font-semibold">cap: +{effectivePoints}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={selectedDatePoints >= 100}
                className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {selectedDatePoints >= 100 ? 'Cap Reached' : isAchievementBased ? 'Log Achievement' : `Log ${formatDuration(duration)}`}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ═══════════════════════════════════════════════
          ACTIVE WEEKEND CHALLENGE
         ═══════════════════════════════════════════════ */}
      {(() => {
        const activeWeekendChallenge = weekendChallenges.find(c => c.isVisible);
        if (!activeWeekendChallenge) return null;

        return (
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500 text-white p-6 md:p-8 rounded-2xl shadow-sm transition-all animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">{activeWeekendChallenge.weekNo}</span>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white mt-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {activeWeekendChallenge.name}
                </h2>
              </div>
              <span className="bg-gradient-to-r from-pink-500 to-orange-400 text-xs font-bold px-3 py-1 rounded-full text-white animate-pulse shadow-lg whitespace-nowrap">
                ACTIVE NOW
              </span>
            </div>

            <div className="space-y-4 text-indigo-100">
              <p className="text-sm bg-white/10 p-4 rounded-xl border border-white/20 leading-relaxed shadow-inner">
                {activeWeekendChallenge.description}
              </p>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-400/30 font-bold text-sm shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activeWeekendChallenge.bonusPointsDesc}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════
          ACTIVITY HISTORY — compact table layout
         ═══════════════════════════════════════════════ */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          My Activity History
          <span className="text-sm font-normal text-slate-400 ml-2">({allMyActivities.length} entries)</span>
        </h2>

        {groupedByDate.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-14 h-14 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No activities logged yet. Start by logging your first activity above!</p>
          </div>
        ) : (() => {
          // Determine which regular categories to show (we want to show all including Sports)
          const activeCats = ACTIVITY_CATEGORIES;
          const hasWeekendBonus = allMyActivities.some(a => a.isWeekendChallenge);

          return (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 sticky left-0 bg-white z-10">
                      Date
                    </th>
                    {activeCats.map(cat => (
                      <th key={cat.id} className="text-center px-2 py-2 border-b-2 border-slate-200">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{cat.name}</span>
                          <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full ${cat.color}`}>
                            {cat.isAchievement ? `${cat.ptsPerSlot}/act` : `${cat.ptsPerSlot}/${cat.slotMins}m`}
                          </span>
                        </div>
                      </th>
                    ))}
                    {hasWeekendBonus && (
                      <th className="text-center px-2 py-2 border-b-2 border-slate-200">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-base">⭐</span>
                          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Bonus</span>
                        </div>
                      </th>
                    )}
                    <th className="text-center px-2 py-2 border-b-2 border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duration</span>
                    </th>
                    <th className="text-center px-3 py-2 text-xs font-black text-indigo-700 uppercase tracking-wider border-b-2 border-indigo-300">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByDate.map(([dateKey, logs], idx) => {
                    const dayTotalRegular = logs.filter(l => !l.isWeekendChallenge).reduce((s, l) => s + l.points, 0);
                    const dayTotalBonus = logs.filter(l => l.isWeekendChallenge).reduce((s, l) => s + l.points, 0);
                    const dayDuration = logs.filter(l => !l.isWeekendChallenge).reduce((s, l) => s + (l.duration || 0), 0);
                    const isEven = idx % 2 === 0;

                    return (
                      <tr key={dateKey} className={`${isEven ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/40 transition-colors`}>
                        {/* Date cell */}
                        <td className={`px-3 py-2.5 sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-slate-50'} border-b border-slate-100`}>
                          <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{fmtDateFriendly(dateKey)}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </td>

                        {/* Category cells */}
                        {activeCats.map(cat => {
                          const catLogs = logs.filter(l => l.category === cat.id && !l.isWeekendChallenge);
                          const catPts = catLogs.reduce((s, l) => s + l.points, 0);
                          const catDur = catLogs.reduce((s, l) => s + (l.duration || 0), 0);

                          return (
                            <td key={cat.id} className="text-center px-2 py-2.5 border-b border-slate-100">
                              {catPts > 0 ? (
                                <div>
                                  <div className="font-black text-indigo-600 text-sm">{catPts}</div>
                                  {catDur > 0 && (
                                    <div className="text-[10px] text-slate-400">{formatDuration(catDur)}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-200">—</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Weekend bonus cell */}
                        {hasWeekendBonus && (
                          <td className="text-center px-2 py-2.5 border-b border-slate-100">
                            {dayTotalBonus > 0 ? (
                              <span className="font-black text-purple-600 text-sm bg-purple-50 px-2 py-0.5 rounded">
                                +{dayTotalBonus}
                              </span>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        )}

                        {/* Duration cell */}
                        <td className="text-center px-2 py-2.5 border-b border-slate-100 text-xs text-slate-500 font-medium">
                          {dayDuration > 0 ? formatDuration(dayDuration) : '—'}
                        </td>

                        {/* Total cell */}
                        <td className="text-center px-3 py-2.5 border-b border-slate-100 bg-indigo-50/30">
                          <div className="font-black text-indigo-700 text-sm">{dayTotalRegular + dayTotalBonus}</div>
                          {dayTotalRegular >= 100 && (
                            <div className="text-[9px] font-black text-emerald-500">MAX</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
