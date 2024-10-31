import React, { useState, useEffect, useCallback } from 'react';
import { User, ThumbsUp, Send, AlertCircle, Reply } from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import { Link } from 'react-router-dom';

const SubCommentSection = ({ commentId, userId }) => {
    const [subComments, setSubComments] = useState([]);
    const [subComment, setSubComment] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingLikes, setPendingLikes] = useState(new Set());

    useEffect(() => {
        const fetchSubComments = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/subcomments/list/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch subcomments');
                const data = await response.json();
                setSubComments(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchSubComments();
    }, [commentId]);

    const handleSubCommentSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!subComment.trim()) {
            setError('Subcomment cannot be empty');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/subcomments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: subComment,
                    comment: commentId,
                    user: userId,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit the subcomment');

            const newSubComment = await response.json();
            setSubComments((prev) => [...prev, newSubComment]);
            setSubComment('');
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = useCallback(async (subCommentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found');
            return;
        }

        // Add to pending likes set
        setPendingLikes(prev => new Set(prev).add(subCommentId));

        // Optimistically update the UI
        setSubComments(prevSubComments => prevSubComments.map(sub => {
            if (sub.id === subCommentId) {
                return {
                    ...sub,
                    is_liked_by_user: !sub.is_liked_by_user,
                    like_count: sub.is_liked_by_user? sub.like_count - 1 : sub.like_count + 1
                };
            }
            return sub;
        }));

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/subcomments/${subCommentId}/like/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like/unlike subcomment');
            }

            // Remove from pending likes after successful response
            setPendingLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(subCommentId);
                return newSet;
            });
        } catch (err) {
            // Revert the optimistic update on error
            setSubComments(prevSubComments => prevSubComments.map(sub => {
                if (sub.id === subCommentId) {
                    return {
                        ...sub,
                        is_liked_by_user: !sub.is_liked_by_user,
                        like_count: sub.liked ? sub.like_count - 1 : sub.like_count + 1
                    };
                }
                return sub;
            }));
            setError(err.message);
            setPendingLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(subCommentId);
                return newSet;
            });
        }
    }, []);

    return (
        <div className="mt-4 flex justify-end">
        <div className="max-w-sm w-full space-y-4">
            {/* Subcomment Form */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.3 }} 
                className="bg-gray-50 rounded-lg shadow-md border border-gray-300 p-4 transition-all duration-200 hover:shadow-lg"
            >
                <form onSubmit={handleSubCommentSubmit} className="space-y-3">
                    <textarea
                        value={subComment}
                        onChange={(e) => setSubComment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-300 outline-none"
                        placeholder="Write your reply here..."
                        rows="2"
                    />
                    <div className="flex justify-end">
                        <motion.button 
                            type="submit" 
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Reply className="h-4 w-4" />
                            {isSubmitting ? 'Sending...' : 'Reply'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
    
            {/* Subcomments List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {subComments.map((sub) => (
                        <motion.div 
                            key={sub.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -20 }} 
                            transition={{ duration: 0.3 }} 
                            className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300 transition-all duration-200 max-w-xl* hover:shadow-lg"
                        >
                            <div className="flex items-start gap-3">
                                {sub.author?.profile_picture ? (
                                    <img
                                        src={sub.author.profile_picture}
                                        alt="Profile"
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
                                    />
                                ) : (
                                    <User size={24} className="text-gray-400" /> 
                                )}
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">
                                        <Link to={`/profile/${sub.author.id}`} className="font-semibold text-gray-900 hover:text-blue-400">
                                {sub.author.username}
                            </Link>
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                            {new Date(sub.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 mt-1">{sub.content}</p>
                                    <div className="mt-3">
                                        <motion.button
                                            onClick={() => handleLike(sub.id)}
                                            disabled={pendingLikes.has(sub.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`inline-flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 ${
                                                pendingLikes.has(sub.id) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            <ThumbsUp 
                                                className={`h-4 w-4 transition-all duration-200 ${
                                                    sub.is_liked_by_user 
                                                        ? 'fill-blue-600 text-blue-600 scale-110' 
                                                        : 'text-gray-400'
                                                }`} 
                                            />
                                            <span className={`${sub.is_liked_by_user ? 'text-blue-600' : 'text-gray-500'}`}>
                                                {sub.like_count || 0}
                                            </span>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    </div>
    
    
    
    );
};

export default SubCommentSection;