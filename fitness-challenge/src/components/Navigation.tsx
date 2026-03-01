'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';

export default function Navigation() {
    const pathname = usePathname();
    const { currentUser, logoutUser } = useAppContext();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/dashboard', label: 'My Activity' },
        { href: '/teams', label: 'My Team' },
        { href: '/all-teams', label: 'All Teams' },
        { href: '/leaderboard', label: 'Leaderboard' },
        ...(currentUser?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
    ];

    return (
        <nav className="bg-ey-dark text-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center">
                        <Link href="/" className="font-black text-lg tracking-tight flex items-center gap-2">
                            <span>Wellbeing Challenge <span className="text-ey-yellow">&apos;26</span></span>
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${pathname === link.href
                                            ? 'bg-ey-yellow text-ey-dark font-bold'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {currentUser ? (
                            <div className="flex items-center gap-3 text-sm">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-1.5 text-ey-yellow font-semibold hover:text-white transition-colors"
                                    title="View / Edit Profile"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{currentUser.fullName || currentUser.name}</span>
                                </Link>
                                <button
                                    onClick={logoutUser}
                                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-semibold transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            <div className="md:hidden border-t border-white/10 flex justify-around p-1.5">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`px-2 py-1.5 rounded text-[10px] font-semibold transition-colors ${pathname === link.href
                            ? 'bg-ey-yellow text-ey-dark'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))
                }
            </div >
        </nav >
    );
}
