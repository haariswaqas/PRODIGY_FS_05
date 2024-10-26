import React, { useState, useEffect, useCallback } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SubCommentList from '../subcomments/SubCommentList';
import { useAuth } from '../context/AuthContext';

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

const CommentSection = ({ postId }) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [expandedCommentId, setExpandedCommentId] = useState(null);
    const [pendingLikes, setPendingLikes] = useState(new Set());
    const { authState } = useAuth(); // Get the auth state to access user info

    // Fetch comments for the post when the component mounts
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
                setComments(data); // Set comments including like counts
            } catch (err) {
                setError(err.message);
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!comment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: comment,
                    post: postId,
                    user: authState.user.id, // Use the user ID from AuthContext
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit the comment');
            }

            const newComment = await response.json();
            setComments((prevComments) => [newComment, ...prevComments]); // Add new comment to the state
            setComment(''); // Clear the input
            setError(null); // Reset error
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
            // Optimistic UI update
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            is_liked_by_user: !comment.is_liked_by_user, // Toggle liked state
                            like_count: comment.is_liked_by_user ? comment.like_count - 1 : comment.like_count + 1 // Update like count
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
        new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <div className="comment-form mt-4">
            <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
            <form onSubmit={handleSubmit} className="flex items-start space-x-2">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Write your comment here..."
                    rows="4"
                    style={{ width: '90%', minHeight: '100px' }}
                ></textarea>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-700 flex items-center justify-center"
                    style={{ height: '40px', width: '40px' }}
                >
                    <FaPaperPlane />
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}

            <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-3">
                {sortedComments.map((comment) => {
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
                                        className={`flex items-center space-x-1 hover:text-blue-500 transition duration-200 ${comment.is_liked_by_user ? 'text-blue-500' : ''}`}
                                        onClick={() => handleCommentLike(comment.id)}
                                        disabled={pendingLikes.has(comment.id)}
                                    >
                                        <span>
                                            {pendingLikes.has(comment.id) ? 'Updating...' : 
                                                comment.is_liked_by_user ? 'Unlike' : 'Like'}
                                        </span>
                                    </button>
                                    <span className="text-gray-500">{comment.like_count} {comment.like_count === 1 ? 'Like' : 'Likes'}</span> {/* Display like count */}
                                </div>
                                <button 
                                    className="hover:text-blue-500 transition duration-200"
                                    onClick={() => handleReplyClick(comment.id)}
                                >
                                    Reply
                                </button>
                            </div>
                            {expandedCommentId === comment.id && (
                                <SubCommentList parentCommentId={comment.id} />
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommentSection;
