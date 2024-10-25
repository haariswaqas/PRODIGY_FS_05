import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import SubCommentList from '../subcomments/SubCommentList';

const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const CommentList = ({ comments: initialComments }) => {
    const [comments, setComments] = useState(initialComments);
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [pendingLikes, setPendingLikes] = useState(new Set());
    
    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    // Function to fetch the latest comments and their like counts
    const fetchComments = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/`);
            const updatedComments = await response.json();
            setComments(updatedComments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    useEffect(() => {
        // Fetch comments after the component mounts to get the latest likes count
        fetchComments();
    }, []);

    const handleCommentLike = useCallback(async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        setPendingLikes(prev => new Set(prev).add(commentId));

        try {
            const currentComment = comments.find(c => c.id === commentId);
            const currentLikes = currentComment?.likes_count || currentComment?.likes || 0;

            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            likes_count: comment.is_liked_by_user ? currentLikes - 1 : currentLikes + 1,
                            is_liked_by_user: !comment.is_liked_by_user
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

            // Refetch comments to ensure likes are up to date
            fetchComments();  // Fetching again to get updated likes

        } catch (error) {
            // Revert optimistic update on error
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        const currentLikes = comment?.likes_count || comment?.likes || 0;
                        return {
                            ...comment,
                            likes_count: comment.is_liked_by_user ? currentLikes + 1 : currentLikes - 1,
                            is_liked_by_user: !comment.is_liked_by_user
                        };
                    }
                    return comment;
                })
            );
            console.error('Error updating like status:', error);
        } finally {
            setPendingLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    }, [comments]);

    const handleReplyClick = useCallback((commentId) => {
        setExpandedCommentId(prevId => prevId === commentId ? null : commentId);
    }, []);

    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div className="mt-6 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-3">
                {sortedComments.map((comment) => {
                    const likesCount = comment.likes_count ?? comment.likes ?? 0;

                    return (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white shadow-sm rounded-lg p-3 transition-transform transform hover:scale-105"
                        >
                            <div className="flex items-start mb-2">
                                <img 
                                    src={comment.author?.profile_picture || '/default-avatar.png'} 
                                    alt="Profile" 
                                    className="h-8 w-8 rounded-full mr-2 object-cover" 
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">
                                            {comment.author ? 
                                                `${comment.author.first_name} ${comment.author.last_name}` : 
                                                'Unknown User'
                                            }
                                        </span>
                                        <span className="text-gray-500 ml-2 text-xs">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 mt-2 pt-2 text-gray-600 text-xs flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button 
                                        className={`flex items-center space-x-1 hover:text-blue-500 transition duration-200 ${
                                            comment.is_liked_by_user ? 'text-blue-500' : ''
                                        }`}
                                        onClick={() => handleCommentLike(comment.id)}
                                        disabled={pendingLikes.has(comment.id)}
                                    >
                                        <span>
                                            {pendingLikes.has(comment.id) ? 'Updating...' : 
                                                comment.is_liked_by_user ? 'Unlike' : 'Like'}
                                        </span>
                                    </button>
                                    <span className="text-gray-500">({likesCount})</span>
                                </div>
                                <button 
                                    className="hover:text-blue-500 transition duration-200"
                                    onClick={() => handleReplyClick(comment.id)}
                                >
                                    Reply
                                </button>
                            </div>

                            {expandedCommentId === comment.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-2 bg-gray-50 p-2 rounded-lg shadow-sm"
                                >
                                    <SubCommentList 
                                        commentId={comment.id} 
                                        userId={comment.author?.id} 
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommentList;
