'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { resetPassword } = useAppContext();

    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!newPassword) {
            setErrorMsg('Please enter a new password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('Password and Confirm Password do not match.');
            return;
        }

        if (newPassword.length < 4) {
            setErrorMsg('Password must be at least 4 characters.');
            return;
        }

        const result = resetPassword(token, newPassword);
        if (!result.success) {
            setErrorMsg(result.message || 'Failed to reset password.');
        } else {
            setSuccessMsg(result.message || 'Password reset successfully!');
        }
    };

    if (!token) {
        return (
            <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Reset Link</h1>
                <p className="text-slate-500 text-sm mb-6">
                    This password reset link is invalid or missing. Please request a new one.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if (successMsg) {
        return (
            <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h1>
                <p className="text-slate-500 text-sm mb-6">
                    {successMsg}. You can now log in with your new password.
                </p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <div className="text-center mb-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-indigo-950 mb-2">Set New Password</h1>
                <p className="text-slate-500 text-sm">
                    Enter your new password below to reset your account password.
                </p>
            </div>

            {errorMsg && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700 text-sm font-medium">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleReset} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter new password"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${confirmPassword && newPassword !== confirmPassword
                                ? 'border-red-400 ring-1 ring-red-300'
                                : 'border-slate-300'
                            }`}
                        placeholder="Re-enter new password"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 font-medium">Passwords do not match</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-transform active:scale-[0.98]"
                >
                    Reset Password
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
                <button
                    onClick={() => router.push('/')}
                    className="font-semibold text-indigo-600 hover:underline flex items-center gap-1 mx-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Login
                </button>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                <div className="animate-pulse">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-200"></div>
                    <div className="h-8 bg-slate-200 rounded w-48 mx-auto mb-4"></div>
                    <div className="h-4 bg-slate-100 rounded w-64 mx-auto"></div>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
