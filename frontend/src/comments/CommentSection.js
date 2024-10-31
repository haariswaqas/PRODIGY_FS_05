import React, { useState, useEffect, useCallback } from 'react';
import { FaPaperPlane, FaPen, FaTrash, FaThumbsUp } from 'react-icons/fa';

import { User, MessageSquare, Heart, Reply, Pen, Trash2, Send, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import formatDate from '../formatting/FormatDate';
import SubCommentSection from './SubCommentSection';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';


const CommentSection = ({ postId }) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [pendingLikes, setPendingLikes] = useState(new Set());
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const { authState } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchComments();
    }, [postId]);

    const createOrEditComment = async (e, commentId = null) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const contentToSubmit = commentId ? editingCommentContent : comment;
        if (!contentToSubmit.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            const url = commentId ? `http://127.0.0.1:8000/api/comments/${commentId}/` : `http://127.0.0.1:8000/api/comments/create/`;
            const method = commentId ? 'PUT' : 'POST';
            const body = JSON.stringify({
                content: contentToSubmit,
                post: postId,
                user: authState.user.id,
            });

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(commentId ? 'Failed to update the comment' : 'Failed to submit the comment');
            }

            const updatedComment = await response.json();
            if (commentId) {
                setComments((prevComments) =>
                    prevComments.map(comment =>
                        comment.id === commentId ? updatedComment : comment
                    )
                );
                setEditingCommentId(null);
                setEditingCommentContent('');
            } else {
                setComments((prevComments) => [updatedComment, ...prevComments]);
                setComment('');
            }
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (commentId, content) => {
        setEditingCommentId(commentId);
        setEditingCommentContent(content);
        // Removed setComment(content) to fix the duplication issue
    };

    const handleDeleteComment = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete the comment');
            }

            setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCommentLike = useCallback(async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        setPendingLikes(prev => new Set(prev).add(commentId));

        try {
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            is_liked_by_user: !comment.is_liked_by_user,
                            like_count: comment.is_liked_by_user ? comment.like_count - 1 : comment.like_count + 1
                        };
                    }
                    return comment;
                })
            );

            const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/like/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like the comment');
            }

        } catch (error) {
            console.error('Error updating like status:', error);
        } finally {
            setPendingLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    }, []);

    const handleReplyClick = useCallback((commentId) => {
        setExpandedCommentId(prevId => prevId === commentId ? null : commentId);
    }, []);

    const sortedComments = [...comments].sort((a, b) => 
        b.like_count - a.like_count || new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div className="comment-form space-y-6 p-6 bg-gray-100 rounded-xl">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-300"
        >
            <div className="flex items-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Join The Discussion</h2>
            </div>
            <form onSubmit={(e) => createOrEditComment(e)} className="space-y-4">
                <div className="relative">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                        placeholder="Share your thoughts..."
                        rows="4"
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center shadow-lg"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </form>
            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 mt-2 flex items-center"
                >
                    <X className="w-4 h-4 mr-1" /> {error}
                </motion.p>
            )}
        </motion.div>
    
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    Comments ({comments.length})
                </h3>
            </div>
            <AnimatePresence>
                {sortedComments.map((comment, index) => {
                    const isAuthor = comment.author.id === authState.user.id;
                    
                    return (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-200"
                        >
                            <div className="flex items-start gap-4">
                                {comment.author?.profile_picture ? (
                                    <motion.img 
                                        whileHover={{ scale: 1.1 }}
                                        src={comment.author.profile_picture} 
                                        alt="Profile" 
                                        className="h-10 w-10 rounded-full ring-2 ring-gray-200"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ring-2 ring-gray-200">
                                        <User size={24} className="text-gray-500" /> {/* Use a nice avatar icon */}
                                    </div>
                                )}
                                <div className="flex-grow space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>

                                        <Link to={`/profile/${comment.author.id}`} className="font-semibold text-gray-900 hover:text-blue-400">
                                {comment.author.username}
                            </Link>
                                            
                                            <p className="text-gray-600 text-sm">{formatDate(comment.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleCommentLike(comment.id)}
                                                disabled={pendingLikes.has(comment.id)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                                                    comment.is_liked_by_user 
                                                    ? 'bg-blue-100 text-blue-600' 
                                                    : 'bg-gray-100 text-gray-700'
                                                } transition-colors duration-200`}
                                            >
                                                <FaThumbsUp className={`w-4 h-4 ${comment.is_liked_by_user ? 'fill-current' : ''}`} />
                                                <span>{comment.like_count}</span>
                                            </motion.button>
    
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleReplyClick(comment.id)}
                                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                                            >
                                                <Reply className="w-4 h-4" />
                                                <span>Reply</span>
                                            </motion.button>
                                            {isAuthor && (
                                                <div className="flex items-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEdit(comment.id, comment.content)}
                                                        className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                                                    >
                                                        <Pen className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {editingCommentId === comment.id ? (
                                        <motion.form 
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onSubmit={(e) => createOrEditComment(e, comment.id)}
                                            className="space-y-3"
                                        >
                                            <textarea
                                                value={editingCommentContent}
                                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                                placeholder="Edit your comment..."
                                                rows="3"
                                            />
                                            <div className="flex gap-2">
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="submit" 
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        </motion.form>
                                    ) : (
                                        <motion.p 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-gray-800 leading-relaxed"
                                        >
                                            {comment.content}
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {expandedCommentId === comment.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 border-l-2 border-gray-200"
                                    >
                                        <SubCommentSection commentId={comment.id} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    </div>
    
    
    );
};



export default CommentSection;