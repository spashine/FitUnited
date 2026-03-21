/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { useState, useEffect } from 'react';

// Icons for navigation links
const NAV_ICONS: Record<string, string> = {
    'Home': '🏠',
    'My Activity': '⚡',
    'My Team': '👥',
    'All Teams': '🌐',
    'Leaderboard': '🏆',
    'Hall of Fame': '🌟',
    'Social Wall': '💬',
    'Weekend Challenges': '⭐',
    'Manage Awards': '🏅',
};

export default function Navigation() {
    const pathname = usePathname();
    const { currentUser, logoutUser } = useAppContext();
    const [scrolled, setScrolled] = useState(false);

    // Add a slight shadow when scrolling down
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'Home' },
        ...(currentUser ? [
            { href: '/dashboard', label: 'My Activity' },
            { href: '/teams', label: 'My Team' },
            { href: '/all-teams', label: 'All Teams' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/hall-of-fame', label: 'Hall of Fame' },
            { href: '/social-wall', label: 'Social Wall' },
        ] : []),
        ...(currentUser?.role === 'admin' ? [
            { href: '/admin/weekend', label: 'Weekend Challenges' },
            { href: '/admin/awards', label: 'Manage Awards' },
        ] : []),
    ];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ey-dark/95 backdrop-blur-md shadow-lg py-1 border-b border-ey-yellow/10' : 'bg-ey-dark py-3'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="group flex items-center gap-3 outline-none">
                            <div className="w-9 h-9 shrink-0 rounded-xl bg-ey-yellow flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,230,0,0.3)] transition-all duration-300">
                                <span className="text-ey-dark text-lg leading-none mt-0.5">⚡</span>
                            </div>
                            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-gray-200 transition-colors hidden sm:block whitespace-nowrap">
                                Wellbeing Challenge <span className="text-ey-yellow">&apos;26</span>
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative group px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                                            isActive
                                                ? 'bg-white/10 text-white shadow-inner'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className={`${isActive ? 'opacity-100 scale-110 drop-shadow' : 'opacity-70 group-hover:opacity-100 group-hover:scale-110'} transition-all`}>
                                            {NAV_ICONS[link.label]}
                                        </span>
                                        <span className={isActive ? "text-ey-yellow" : ""}>{link.label}</span>
                                        
                                        {/* Active Indicator Line */}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-ey-yellow rounded-t-full shadow-[0_0_8px_rgba(255,230,0,0.6)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side - Profile & Auth */}
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-3 sm:gap-5">
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-3 group outline-none rounded-full p-1 pr-3 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-ey-yellow transition-colors shadow-sm shrink-0 bg-gray-800 flex items-center justify-center relative">
                                        {currentUser.avatarUrl ? (
                                            <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl">🧑</span>
                                        )}
                                        {/* Optional status green dot */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-ey-dark rounded-full"></div>
                                    </div>
                                    <div className="flex flex-col items-start hidden sm:flex">
                                        <span className="text-white font-bold text-sm tracking-wide group-hover:text-ey-yellow transition-colors">
                                            {currentUser.fullName || currentUser.name}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ROLE</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${currentUser.role === 'admin' ? 'bg-ey-yellow/20 text-ey-yellow border border-ey-yellow/30' : 'bg-white/10 text-gray-300 border border-white/20'}`}>
                                                {currentUser.role === 'admin' ? 'Admin' : 'Challenger'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                
                                <div className="h-8 w-px bg-gray-700/50 hidden sm:block"></div>
                                
                                <button
                                    onClick={() => {
                                        logoutUser();
                                        window.location.href = '/';
                                    }}
                                    className="p-2.5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-colors outline-none flex items-center justify-center group"
                                    title="Logout"
                                >
                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════
                 Mobile / Tablet Horizontal Tab Navigation
                ═══════════════════════════════════════════════ */}
            <div className="lg:hidden w-full border-t border-gray-800 bg-ey-dark/95 backdrop-blur-md overflow-x-auto scrollbar-hide overscroll-x-contain shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] mt-2">
                <div className="flex px-2 py-2 gap-1 min-w-max">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 relative ${
                                    isActive
                                        ? 'bg-ey-yellow/15 text-ey-yellow'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}
                            >
                                <span className={`text-xl mb-1.5 transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,230,0,0.5)]' : 'opacity-80'}`}>
                                    {NAV_ICONS[link.label]}
                                </span>
                                <span className={`text-[10px] font-bold whitespace-nowrap tracking-wide ${isActive ? 'text-ey-yellow' : ''}`}>
                                    {link.label}
                                </span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-ey-yellow rounded-t-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
