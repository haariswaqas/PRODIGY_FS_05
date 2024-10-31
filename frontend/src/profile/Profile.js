import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User, Edit, CheckCircle, MapPin, Phone, Mail, UserPlus, Camera} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat2 } from 'lucide-react';
import formatDate from '../formatting/FormatDate';
import { faThumbsUp, faTrash, faThumbsDown, faComment, faEdit } from '@fortawesome/free-solid-svg-icons';
import FollowersList from '../followers/FollowersList';
import FollowingList from '../followers/FollowingList';
import CommentSection from '../comments/CommentSection';
import axios from 'axios';

const Profile = () => {
  const { authState } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [repostError, setRepostError] = useState(null);
  const [repostLoading, setRepostLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState({});
  const [posts, setPosts] = useState([]); // State to hold posts

  
  const [showCommentForm, setShowCommentForm] = useState({});

  // Fetch profile details
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profiles/${id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);

      // Check if the logged-in user is following this profile
      const isUserFollowing = data.is_following; // Use is_following from the fetched data
      setIsFollowing(isUserFollowing);
      setFollowersCount(data.followers.length); // Update followers count based on fetched data
      setFollowingCount(data.following.length); // Update following count based on fetched data

      // Fetch posts belonging to the user
      const postsResponse = await fetch(`http://127.0.0.1:8000/api/posts/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      });

      if (!postsResponse.ok) {
        throw new Error('Failed to fetch posts');
      }

      const postsData = await postsResponse.json();
      // Filter posts that belong to the user
      const userPosts = postsData.filter(post => post.author.id === data.id);
      setPosts(userPosts);
      userPosts.forEach(post => {
        fetchComments(post.id); // Fetch comments for each post
      }); // Set the filtered posts
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, authState.token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollowUnfollow = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const response = await fetch(`http://127.0.0.1:8000/api/follow-unfollow/${profile.username}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow the user');
      }

      // Store the previous follower status and count
      const prevIsFollowing = isFollowing;
      const prevFollowersCount = followersCount;

      // Toggle the following status
      const newIsFollowing = !prevIsFollowing;

      // Update the followers count
      const newFollowersCount = newIsFollowing ? prevFollowersCount + 1 : Math.max(prevFollowersCount - 1, 0);

      // Set the new states in a single update to avoid unnecessary re-renders
      setIsFollowing(newIsFollowing);
      setFollowersCount(newFollowersCount);

      // Optionally update the profile state to reflect the new following status
      setProfile((prevProfile) => ({
        ...prevProfile,
        is_following: newIsFollowing,
      }));

    } catch (error) {
      setError(error.message);
    }
  };


  

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }
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
                    const isLiked = post.likes.includes(authState.user?.id);
                    return {
                        ...post,
                        likes: isLiked 
                            ? post.likes.filter(userId => userId !== authState.user?.id)
                            : [...post.likes, authState.user?.id],
                        dislikes: post.dislikes.filter(userId => userId !== authState.user?.id),
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
                    const isDisliked = post.dislikes.includes(authState.user?.id);
                    return {
                        ...post,
                        dislikes: isDisliked 
                            ? post.dislikes.filter(userId => userId !== authState.user?.id)
                            : [...post.dislikes, authState.user?.id],
                        likes: post.likes.filter(userId => userId !== authState.user?.id),
                    };
                }
                return post;
            })
        );
    } catch (error) {
        setError(error.message);
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
          // Navigate back to the user's profile after deletion
          navigate(`/profile/${id}`); // Adjust the path as needed
      }, 2000);
  } catch (err) {
      setError('Failed to delete the post. Please try again.');
      setSuccess(null);
  }
};


const formVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
const toggleFollowers = () => {
  setShowFollowers((prev) => !prev); // Toggle followers visibility
};

const toggleFollowing = () => {
  setShowFollowing((prev) => !prev); // Toggle following visibility
};
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
            [postId]: data.length, // Update comments count for the specific post
        }));
    } catch (err) {
        setError(err.message);
    }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

const statsItemVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

return (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    className="max-w-6xl mx-auto p-4 bg-gray-50"
  >
    {/* Top Section with Followers/Following Lists */}
    <AnimatePresence>
      {(showFollowers || showFollowing) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {showFollowers ? 'Followers' : 'Following'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowFollowers(false);
                setShowFollowing(false);
              }}
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
            >
              Close
            </motion.button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {showFollowers && <FollowersList profile={profile} />}
            {showFollowing && <FollowingList profile={profile} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Profile Header */}
    <div className="relative bg-gradient-to-b from-blue-500 to-blue-600 rounded-t-xl h-48">
      <div className="absolute -bottom-16 w-full flex justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
              <User size={64} className="text-gray-400" />
            </div>
          )}
          {profile?.id === authState.user?.id && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-0 right-0"
            >
              <Link to={`/edit-profile/${profile.id}/`} state={{ isEditing: true, initialData: profile }}>
                <button className="bg-blue-500 p-2 rounded-full text-white shadow-lg">
                  <Camera size={20} />
                </button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>

    {/* Profile Info */}
    <div className="mt-20 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-800"
      >
        {profile?.first_name} {profile?.last_name}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 mt-1"
      >
        @{profile?.username}
      </motion.p>

      {/* Stats Section */}
      <motion.div
        variants={statsItemVariants}
        className="flex justify-center space-x-12 mt-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowFollowers(true)}
          className="cursor-pointer group"
        >
          <div className="text-2xl font-bold text-blue-600">{followersCount}</div>
          <div className="text-sm text-gray-600 group-hover:text-blue-600">Followers</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowFollowing(true)}
          className="cursor-pointer group"
        >
          <div className="text-2xl font-bold text-blue-600">{followingCount}</div>
          <div className="text-sm text-gray-600 group-hover:text-blue-600">Following</div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }}>
          <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
          <div className="text-sm text-gray-600">Posts</div>
        </motion.div>
      </motion.div>

      {/* Follow/Edit Button */}
      {profile?.id !== authState.user?.id ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFollowUnfollow}
          className={`mt-6 px-6 py-2 rounded-full flex items-center justify-center space-x-2 mx-auto
            ${isFollowing 
              ? 'bg-white text-blue-500 border-2 border-blue-500 hover:bg-blue-50' 
              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {isFollowing ? (
            <>
              <CheckCircle size={18} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Follow</span>
            </>
          )}
        </motion.button>
      ) : (
        <Link to={`/edit-profile/${profile.id}/`} state={{ isEditing: true, initialData: profile }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center space-x-2 mx-auto"
          >
            <Edit size={18} />
            <span>Edit Profile</span>
          </motion.button>
        </Link>
      )}

      {/* Bio Section */}
      <motion.div
        variants={cardVariants}
        className="mt-8 bg-white rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">About</h2>
        <p className="text-gray-600">{profile?.bio || 'No bio available'}</p>

        {/* Contact Information */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile?.location && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin size={18} className="text-blue-500" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile?.phone_number && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone size={18} className="text-blue-500" />
              <span>{profile.phone_number}</span>
            </div>
          )}
          {profile?.email && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail size={18} className="text-blue-500" />
              <span>{profile.email}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Posts Section */}
      <motion.div
    className="max-w-4xl mx-auto p-4 bg-blue-50 min-h-screen"
    initial="initial"
    animate="animate"
    variants={formVariants}
>
    <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Your Posts</h2>
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
                            <strong>Reposted from @{post.reposted_from.author.username}:</strong> 
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
                        onClick={() => handleRepost(post.id)} 
                        className={`flex items-center space-x-2 p-2 rounded-full 
                            hover:bg-green-50 group transition-colors duration-200 
                            ${repostLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title="Repost"
                        disabled={repostLoading} 
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

    </div>
  </motion.div>
);
};
             
             
         



export default Profile;