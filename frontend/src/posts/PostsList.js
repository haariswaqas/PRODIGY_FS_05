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
    className="max-w-4xl mx-auto p-4 bg-blue-50 min-h-screen"
    initial="initial"
    animate="animate"
    variants={formVariants}
>
    <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Posts</h2>
    <motion.div className="space-y-4">
        {posts.map((post) => (
            <motion.div
                key={post.id}
                className="bg-white p-4 rounded-lg shadow-md transition duration-300 hover:shadow-lg relative"
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                        {post.author.profile_picture ? (
                            <img 
                                src={post.author.profile_picture} 
                                alt="Profile" 
                                className="h-10 w-10 rounded-full mr-2 border border-gray-200" 
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
                                <User size={24} className="text-gray-400" /> 
                            </div>
                        )}
                    </div>

                    <div>
                        <Link to={`/profile/${post.author.id}`} className="text-xl font-semibold hover:text-blue-600">
                            {post.author.first_name} {post.author.last_name}
                        </Link>
                        <div>
                            <Link to={`/profile/${post.author.id}`} className="text-gray-500 text-sm hover:text-blue-400">
                                @{post.author.username}
                            </Link>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                {post.reposted_from ? (
        <div className="mt-2 p-4 border-l-4 border-blue-400 bg-blue-100 text-gray-800 italic">
          <blockquote className="pl-4">
            <strong>
              Reposted from{' '}
              <Link 
                to={`/profile/${post.reposted_from.author.id}`} // Link to the user's profile
                className="text-blue-600 hover:underline"
              >
                @{post.reposted_from.author.username}
              </Link>:
            </strong>
            <p className="quotes">"{post.reposted_from.content}"</p>
            <span className="text-xs text-gray-500">{formatDate(post.reposted_from.created_at)}</span>
          </blockquote>
        </div>
      ) : (
        <p className="mt-2 text-gray-800">{post.content}</p>
      )}
                {post.image && (
                    <img src={post.image} alt="Post" className="mt-2 rounded-lg w-full h-auto shadow-md" />
                )}

                {/* Edit and Delete buttons */}
                {authState.user?.id === post.author.id && (
                    <>
                        <Link 
                            to={`/edit-post/${post.id}`} 
                            className="absolute top-2 right-16 text-blue-500 hover:underline"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button
                            onClick={() => deletePost(post.id)}
                            className="absolute top-2 right-4 text-red-500 hover:underline"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </>
                )}

                {/* Like and Dislike Buttons */}
                <div className="flex justify-between mt-2">
                    <div className="flex space-x-2">
                        {/* Likes Section */}
                        <motion.div
                            className="flex flex-col items-center"
                            whileHover={{ scale: post.dislikes.includes(authState.user?.id) ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-sm text-gray-500 mb-1">
                                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                            </div>
                            <button
                                onClick={() => handleLike(post.id)}
                                disabled={post.dislikes.includes(authState.user?.id)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm transition duration-300 ${post.likes.includes(authState.user?.id) ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-100'} hover:text-blue-600`}
                            >
                                <FontAwesomeIcon
                                    icon={faThumbsUp}
                                    className={`mr-2 ${post.likes.includes(authState.user?.id) ? 'text-white' : 'text-blue-500'}`}
                                />
                                {post.likes.includes(authState.user?.id) ? 'Liked' : 'Like'}
                            </button>
                        </motion.div>

                        {/* Dislikes Section */}
                        <motion.div
                            className="flex flex-col items-center"
                            whileHover={{ scale: post.likes.includes(authState.user?.id) ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-sm text-gray-500 mb-1">
                                {post.dislikes.length} {post.dislikes.length === 1 ? 'dislike' : 'dislikes'}
                            </div>
                            <button
                                onClick={() => handleDislike(post.id)}
                                disabled={post.likes.includes(authState.user?.id)}
                                className={`flex items-center px-4 py-2 rounded-md text-sm transition duration-300 ${post.dislikes.includes(authState.user?.id) ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 hover:bg-gray-100'} hover:text-red-600`}
                            >
                                <FontAwesomeIcon
                                    icon={faThumbsDown}
                                    className={`mr-2 ${post.dislikes.includes(authState.user?.id) ? 'text-white' : 'text-red-500'}`}
                                />
                                {post.dislikes.includes(authState.user?.id) ? 'Disliked' : 'Dislike'}
                            </button>
                        </motion.div>
                    </div>
                    <button
    onClick={() => handleRepost(post.id)} // Pass the post ID
    className={`flex items-center space-x-2 p-2 rounded-full 
        hover:bg-green-50 group transition-colors duration-200 
        ${repostLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    title="Repost"
    disabled={repostLoading} // Disable button if loading
>
    <Repeat2 
        className={`w-5 h-5 transition-transform duration-200 
            text-green-600 group-hover:scale-110`}
    />
    <span className={`text-sm group-hover:text-green-600`}>
        Repost
    </span>
</button>


                    {/* Comments Section */}
                    <div className="mt-6">
                        <button
                            onClick={() => handleToggleCommentForm(post.id)}
                            className="flex items-center px-4 py-2 rounded-md text-sm transition duration-300 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-600"
                        >
                            <FontAwesomeIcon icon={faComment} className="mr-2 text-blue-500" />
                            Comment <span className="text-sm text-gray-500 mb-0 ml-2">({commentsCount[post.id] || 0})</span>
                        </button>
                    </div>
                </div>

                {/* Comment Form */}
                {showCommentForm[post.id] && (
                    <CommentSection postId={post.id} />
                )}
            </motion.div>
        ))}
    </motion.div>

    {/* Success and Error Messages */}
    {success && (
        <div className="text-green-500 text-center mt-4">
            {success}
        </div>
    )}
    {error && (
        <div className="text-red-500 text-center mt-4">
            {error}
        </div>
    )}
</motion.div>

    );
};

export default PostsList;
