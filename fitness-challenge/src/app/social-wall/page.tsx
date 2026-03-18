/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';

export default function SocialWall() {
    const router = useRouter();
    const {
        currentUser, users, posts, createPost, toggleLikePost, addComment,
        weekendChallenges
    } = useAppContext();

    // Protect route — redirect if not logged in
    useEffect(() => {
        if (!currentUser) router.push('/');
    }, [currentUser, router]);

    const [newPostContent, setNewPostContent] = useState('');
    const [newPostMedia, setNewPostMedia] = useState('');
    const [selectedChallenge, setSelectedChallenge] = useState('');
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() && !newPostMedia.trim()) return;

        createPost({
            userId: currentUser!.id,
            content: newPostContent,
            mediaUrl: newPostMedia || undefined,
            weekendChallengeId: selectedChallenge || undefined
        });

        // Reset
        setNewPostContent('');
        setNewPostMedia('');
        setSelectedChallenge('');
    };

    const handleAddComment = (postId: string) => {
        if (!currentUser) return;
        const text = commentTexts[postId];
        if (!text || !text.trim()) return;

        addComment(postId, text);
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure it's an image or short video (size limit ~5MB for local storage)
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large! Please select an image under 5MB.");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewPostMedia(reader.result as string);
            setIsUploading(false);
        };
        reader.onerror = () => {
            alert('Error reading file. Try a URL instead.');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const getUser = (userId: string): User | undefined => {
        return users.find(u => u.id === userId);
    };

    const getChallengeName = (challengeId: string) => {
        const challenge = weekendChallenges.find(c => c.id === challengeId);
        return challenge ? challenge.name : 'Unknown Challenge';
    };

    // Only published weekend challenges should be taggable
    const activeChallenges = weekendChallenges.filter(c => c.isVisible);

    if (!currentUser) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Social Wall</h1>
                <p className="text-gray-600 mt-2">Share your workouts, photos, and cheer for your team!</p>
            </div>

                {/* Create Post Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <form onSubmit={handleCreatePost}>
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="What's on your mind? How was your workout today?"
                                rows={3}
                            />

                            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*,video/mp4,video/quicktime"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {isUploading ? 'Uploading...' : 'Upload Image / Video'}
                                </button>
                                <span className="text-gray-400 text-sm">OR</span>
                                <input
                                    type="text"
                                    value={newPostMedia}
                                    onChange={(e) => setNewPostMedia(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                                    placeholder="Paste Media URL here"
                                />

                                {activeChallenges.length > 0 && (
                                    <select
                                        value={selectedChallenge}
                                        onChange={(e) => setSelectedChallenge(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">No Challenge Tag</option>
                                        {activeChallenges.map(c => (
                                            <option key={c.id} value={c.id}>
                                                Tag: {c.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Preview section if uploaded a file or pasted a data URL */}
                            {newPostMedia && newPostMedia.startsWith('data:') && (
                                <div className="mt-4 border border-gray-200 rounded-lg p-2 bg-gray-50 flex items-start gap-4 inline-block">
                                    <div className="w-24 h-24 relative rounded overflow-hidden">
                                        {newPostMedia.startsWith('data:video') ? (
                                            <video src={newPostMedia} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={newPostMedia} alt="Preview" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNewPostMedia('')}
                                        className="text-red-500 text-sm hover:underline mt-1"
                                    >
                                        Remove Attachment
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!newPostContent.trim() && !newPostMedia.trim() || isUploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
                                >
                                    Post
                                </button>
                            </div>
                        </form>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                        </div>
                    ) : (
                        posts.map(post => {
                            const postUser = getUser(post.userId);
                            const isVideo = post.mediaUrl?.match(/\.(mp4|mov|webm)$/i) || post.mediaUrl?.startsWith('data:video');
                            const iLiked = currentUser ? post.likes.includes(currentUser.id) : false;

                            return (
                                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                {postUser?.avatarUrl ? (
                                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm shrink-0 overflow-hidden">
                                                        <img src={postUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                                                        {postUser?.name.charAt(0) || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{postUser?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(post.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {post.weekendChallengeId && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    🏆 {getChallengeName(post.weekendChallengeId)}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-800 mt-4 whitespace-pre-wrap">{post.content}</p>

                                        {post.mediaUrl && (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
                                                {isVideo ? (
                                                    <video src={post.mediaUrl} controls className="w-full h-auto max-h-[500px] object-contain" />
                                                ) : (
                                                    <img src={post.mediaUrl} alt="Post media" className="w-full h-auto max-h-[500px] object-contain" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action bar */}
                                    <div className="px-6 py-3 border-y border-gray-100 bg-gray-50 flex items-center space-x-6 text-sm">
                                        <button
                                            onClick={() => {
                                                toggleLikePost(post.id);
                                            }}
                                            className={`flex items-center space-x-1 ${iLiked ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <svg className="w-5 h-5" fill={iLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" />
                                            </svg>
                                            <span>{post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}</span>
                                        </button>

                                        <div className="flex items-center space-x-1 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                                        </div>
                                    </div>

                                    {/* Comments section */}
                                    <div className="p-6 bg-gray-50">
                                        <div className="space-y-4 mb-4">
                                            {post.comments.map(comment => {
                                                const commentUser = getUser(comment.userId);
                                                return (
                                                    <div key={comment.id} className="flex space-x-3 text-sm">
                                                        {commentUser?.avatarUrl ? (
                                                            <div className="h-8 w-8 rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm">
                                                                <img src={commentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                                {commentUser?.name.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                            <div className="flex items-baseline justify-between">
                                                                <span className="font-semibold text-gray-900">{commentUser?.name || 'Unknown'}</span>
                                                                <span className="text-xs text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-gray-700 mt-1">{comment.content}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
                                                <input
                                                    type="text"
                                                    value={commentTexts[post.id] || ''}
                                                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    placeholder="Write a comment..."
                                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddComment(post.id);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleAddComment(post.id)}
                                                    disabled={!commentTexts[post.id]?.trim()}
                                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors"
                                                >
                                                    Comment
                                                </button>
                                            </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
        </div>
    );
}
