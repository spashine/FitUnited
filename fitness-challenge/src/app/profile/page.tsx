/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import { WorkStream, Location } from '@/types';

const WORK_STREAMS: WorkStream[] = [
    'Catalyst', 'Cloud', 'Contact Center', 'Data', 'EYP',
    'Growth Protocol', 'ITOPS', 'OCE', 'Pricing', 'Risk', 'SCO', 'Tax', 'TMO',
];

export default function ProfilePage() {
    const router = useRouter();
    const { currentUser, updateProfile, changePassword } = useAppContext();

    // Profile fields
    const [fullName, setFullName] = useState(currentUser?.fullName || currentUser?.name || '');
    const [contactNumber, setContactNumber] = useState(currentUser?.contactNumber || '');
    const [workStream, setWorkStream] = useState<WorkStream>(currentUser?.workStream || 'Cloud');
    const [location, setLocation] = useState<Location>(currentUser?.location || 'US');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

    // Password fields
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');

    // Messages
    const [profileMsg, setProfileMsg] = useState('');
    const [profileError, setProfileError] = useState('');
    const [pwdMsg, setPwdMsg] = useState('');
    const [pwdError, setPwdError] = useState('');

    if (!currentUser) {
        router.push('/');
        return null;
    }

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg('');
        setProfileError('');

        if (!fullName.trim()) {
            setProfileError('Full Name is required.');
            return;
        }

        const result = updateProfile({
            fullName: fullName.trim(),
            contactNumber: contactNumber.trim(),
            workStream,
            location,
            avatarUrl,
        });

        if (result.success) {
            setProfileMsg(result.message || 'Profile updated!');
            setTimeout(() => setProfileMsg(''), 4000);
        } else {
            setProfileError(result.message || 'Update failed.');
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPwdMsg('');
        setPwdError('');

        if (!newPwd) {
            setPwdError('New password is required.');
            return;
        }
        if (newPwd.length < 4) {
            setPwdError('Password must be at least 4 characters.');
            return;
        }
        if (newPwd !== confirmPwd) {
            setPwdError('New password and confirmation do not match.');
            return;
        }

        const result = changePassword(currentPwd, newPwd);
        if (result.success) {
            setPwdMsg(result.message || 'Password changed!');
            setCurrentPwd('');
            setNewPwd('');
            setConfirmPwd('');
            setTimeout(() => setPwdMsg(''), 4000);
        } else {
            setPwdError(result.message || 'Password change failed.');
        }
    };

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ey-yellow outline-none text-sm";
    const inputDisabledClass = "w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-ey-dark">My Profile</h1>
                <p className="text-gray-500 mt-1">View and update your account details.</p>
            </header>

            {/* ═══════════════════════════════════════════════
          PROFILE DETAILS
         ═══════════════════════════════════════════════ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-ey-dark mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-ey-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Details
                </h2>

                {profileMsg && (
                    <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-md text-emerald-700 text-sm font-medium">
                        {profileMsg}
                    </div>
                )}
                {profileError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md text-red-700 text-sm font-medium">
                        {profileError}
                    </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                    {/* Read-only fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                Username
                                <span className="text-[10px] text-gray-400 ml-1">(cannot be changed)</span>
                            </label>
                            <input
                                type="text"
                                value={currentUser.username || currentUser.id}
                                disabled
                                className={inputDisabledClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Email
                                <span className="text-[10px] text-gray-400 ml-1">(cannot be changed)</span>
                            </label>
                            <input
                                type="text"
                                value={currentUser.email || '—'}
                                disabled
                                className={inputDisabledClass}
                            />
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div>
                        <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Contact Number</label>
                            <input
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                className={inputClass}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Profile Picture</label>
                            <div className="flex items-center gap-4">
                                {avatarUrl ? (
                                    <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-gray-200">
                                        <img src={avatarUrl} alt="Avatar profile" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold border border-gray-300">
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ey-yellow file:text-ey-dark hover:file:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        if (file.size > 2 * 1024 * 1024) return alert("max 2MB");
                                        const reader = new FileReader();
                                        reader.onloadend = () => setAvatarUrl(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Work Stream</label>
                            <select
                                value={workStream}
                                onChange={(e) => setWorkStream(e.target.value as WorkStream)}
                                className={`${inputClass} bg-white`}
                            >
                                {WORK_STREAMS.map(ws => (
                                    <option key={ws} value={ws}>{ws}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Primary Location</label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value as Location)}
                                className={`${inputClass} bg-white`}
                            >
                                <option value="US">United States</option>
                                <option value="Mexico">Mexico</option>
                                <option value="India">India</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-ey-dark hover:bg-ey-darker text-ey-yellow font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                </form>
            </div>

            {/* ═══════════════════════════════════════════════
          CHANGE PASSWORD
         ═══════════════════════════════════════════════ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-ey-dark mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-ey-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                </h2>

                {pwdMsg && (
                    <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-md text-emerald-700 text-sm font-medium">
                        {pwdMsg}
                    </div>
                )}
                {pwdError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md text-red-700 text-sm font-medium">
                        {pwdError}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label className={labelClass}>Current Password</label>
                        <input
                            type="password"
                            value={currentPwd}
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            className={inputClass}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>New Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                className={inputClass}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Confirm New Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={confirmPwd}
                                onChange={(e) => setConfirmPwd(e.target.value)}
                                className={`${inputClass} ${confirmPwd && newPwd !== confirmPwd ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                                placeholder="Re-enter new password"
                                required
                            />
                            {confirmPwd && newPwd !== confirmPwd && (
                                <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-ey-dark hover:bg-ey-darker text-ey-yellow font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}
