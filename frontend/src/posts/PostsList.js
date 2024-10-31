import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment, faEdit, faTrash, faRetweet } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Repeat2 } from 'lucide-react';

import formatDate from '../formatting/FormatDate';
import CommentSection from '../comments/CommentSection';

const PostsList = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [filteredPosts, setFilteredPosts] = useState([]); // New filtered state
    const userId = authState.user?.id;
    const [posts, setPosts] = useState([]);
    const [commentsCount, setCommentsCount] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [repostError, setRepostError] = useState(null);
    const [repostLoading, setRepostLoading] = useState(false);
  
    const [showCommentForm, setShowCommentForm] = useState({});

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/posts/');
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data);
                data.forEach((post) => fetchComments(post.id));
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const fetchComments = async (postId) => {
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
            setCommentsCount((prevCount) => ({
                ...prevCount,
                [postId]: data.length,
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const deletePost = async (postId) => {
        // Confirmation dialog
        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (!confirmDelete) return; // Exit the function if the user cancels
    
        try {
            const apiUrl = `http://127.0.0.1:8000/api/posts/${postId}/`; 
    
            await axios.delete(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                },
            });
    
            setSuccess('Post deleted successfully!');
            setPosts(posts.filter(post => post.id !== postId)); // Update the state to remove the deleted post
    
            setTimeout(() => {
                navigate('/posts'); 
            }, 2000);
        } catch (err) {
            setError('Failed to delete the post. Please try again.');
            setSuccess(null);
        }
    };
    

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/like/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like the post');
            }

            setPosts((prevPosts) => 
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        const isLiked = post.likes.includes(userId);
                        return {
                            ...post,
                            likes: isLiked 
                                ? post.likes.filter(id => id !== userId)
                                : [...post.likes, userId],
                            dislikes: post.dislikes.filter(id => id !== userId),
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDislike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/dislike/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to dislike the post');
            }

            setPosts((prevPosts) => 
                prevPosts.map((post) => {
                    if (post.id === postId) {
                        const isDisliked = post.dislikes.includes(userId);
                        return {
                            ...post,
                            dislikes: isDisliked
                                ? post.dislikes.filter(id => id !== userId)
                                : [...post.dislikes, userId],
                            likes: post.likes.filter(id => id !== userId),
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRepost = async (postId) => {
        setRepostLoading(true);
        setRepostError(null);

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/posts/repost/',
                { post_id: postId },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                }
            );

            // Add the new repost to the post list
            setPosts((prevPosts) => [response.data, ...prevPosts]);
        } catch (err) {
            setRepostError(
                err.response && err.response.data.error
                    ? err.response.data.error
                    : "An error occurred while reposting."
            );
        } finally {
            setRepostLoading(false);
        }
    };

    const handleToggleCommentForm = (postId) => {
        setShowCommentForm((prevState) => ({
            ...prevState,
            [postId]: !prevState[postId],
        }));
    };

    if (loading) {
        return <div className="text-center text-blue-500">Loading posts...</div>;
    }
    
    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }
    
    const formVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };
    
    return (
        <motion.div
        className="max-w-4xl mx-auto p-4 min-h-screen"
        initial="initial"
        animate="animate"
        variants={formVariants}
    >
        <motion.div className="space-y-6">
            {posts.map((post) => (
                <motion.div
                    key={post.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 relative"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            {post.author.profile_picture ? (
                                <img 
                                    src={post.author.profile_picture} 
                                    alt="Profile" 
                                    className="h-12 w-12 rounded-full mr-4 border-2 border-indigo-100 shadow-sm" 
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 flex items-center justify-center border-2 border-indigo-100 shadow-sm">
                                    <User size={24} className="text-indigo-400" />
                                </div>
                            )}
                        </div>

                        <div>
                            <Link to={`/profile/${post.author.id}`} className="text-xl font-semibold text-gray-800 hover:text-indigo-600 transition duration-200">
                                {post.author.first_name} {post.author.last_name}
                            </Link>
                            <div>
                                <Link to={`/profile/${post.author.id}`} className="text-gray-500 text-sm hover:text-indigo-400 transition duration-200">
                                    @{post.author.username}
                                </Link>
                                <span className="text-xs text-gray-400 ml-2">• {formatDate(post.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {post.reposted_from ? (
                        <div className="mt-4 p-4 border-l-4 border-indigo-400 bg-indigo-50 rounded-r-lg">
                            <blockquote className="pl-4">
                                <strong className="text-gray-700">
                                    Reposted from{' '}
                                    <Link 
                                        to={`/profile/${post.reposted_from.author.id}`}
                                        className="text-indigo-600 hover:text-indigo-700 hover:underline"
                                    >
                                        @{post.reposted_from.author.username}
                                    </Link>:
                                </strong>
                                <p className="mt-2 text-gray-600 italic">"{post.reposted_from.content}"</p>
                                <span className="text-xs text-gray-400">{formatDate(post.reposted_from.created_at)}</span>
                            </blockquote>
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-700 text-lg">{post.content}</p>
                    )}

                    {post.image && (
                        <img 
                            src={post.image} 
                            alt="Post" 
                            className="mt-4 rounded-lg w-full h-auto shadow-md hover:shadow-lg transition duration-300" 
                        />
                    )}

                    {/* Actions Bar */}
                    <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                        <div className="flex space-x-4">
                            {/* Like Button */}
                            <motion.button
                                onClick={() => handleLike(post.id)}
                                disabled={post.dislikes.includes(authState.user?.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
                                    post.likes.includes(authState.user?.id)
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faThumbsUp} />
                                <span>{post.likes.length}</span>
                            </motion.button>

                            {/* Dislike Button */}
                            <motion.button
                                onClick={() => handleDislike(post.id)}
                                disabled={post.likes.includes(authState.user?.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
                                    post.dislikes.includes(authState.user?.id)
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faThumbsDown} />
                                <span>{post.dislikes.length}</span>
                            </motion.button>

                            {/* Comment Button */}
                            <motion.button
                                onClick={() => handleToggleCommentForm(post.id)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 transition duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FontAwesomeIcon icon={faComment} />
                                <span>{commentsCount[post.id] || 0}</span>
                            </motion.button>
                        </div>

                        {/* Repost Button */}
                        <motion.button
                            onClick={() => handleRepost(post.id)}
                            disabled={repostLoading}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-600 transition duration-200 ${
                                repostLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Repeat2 className="w-5 h-5" />
                            <span>Repost</span>
                        </motion.button>
                    </div>

                    {/* Author Actions */}
                    {authState.user?.id === post.author.id && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <Link 
                                to={`/edit-post/${post.id}`}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition duration-200"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </Link>
                            <button
                                onClick={() => deletePost(post.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition duration-200"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    )}

                    {/* Comments Section */}
                    {showCommentForm[post.id] && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <CommentSection postId={post.id} />
                        </div>
                    )}
                </motion.div>
            ))}
        </motion.div>
    </motion.div>

    );
};

export default PostsList;
