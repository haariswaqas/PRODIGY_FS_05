import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaCheckCircle, FaThumbsDown, FaThumbsUp, FaComment } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { User, Edit, CheckCircle, MapPin, Phone, Mail, ThumbsUp, ThumbsDown, MessageCircle, Users, UserPlus, Calendar, Globe, Award, Camera} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import formatDate from '../formatting/FormatDate';
import { faThumbsUp, faThumbsDown, faComment, faEdit } from '@fortawesome/free-solid-svg-icons';


import FollowersList from '../followers/FollowersList';
import FollowingList from '../followers/FollowingList';
import CommentSection from '../comments/CommentSection';

const Profile = () => {
  const { authState } = useAuth();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = authState.user?.id;
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
        variants={cardVariants}
        className="mt-8 bg-white rounded-xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Posts</h2>
          <div className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{post.title}</h3>
                      <div className="text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-2 group"
                      >
                        <ThumbsUp
                          size={18}
                          className={`transition-colors ${
                            post.likes.includes(authState.user?.id)
                              ? 'text-blue-500'
                              : 'text-gray-400 group-hover:text-blue-500'
                          }`}
                        />
                        <span className={`text-sm ${
                          post.likes.includes(authState.user?.id)
                            ? 'text-blue-500'
                            : 'text-gray-500'
                        }`}>
                          {post.likes.length}
                        </span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDislike(post.id)}
                        className="flex items-center space-x-2 group"
                      >
                        <ThumbsDown
                          size={18}
                          className={`transition-colors ${
                            post.dislikes.includes(authState.user?.id)
                              ? 'text-red-500'
                              : 'text-gray-400 group-hover:text-red-500'
                          }`}
                        />
                        <span className={`text-sm ${
                          post.dislikes.includes(authState.user?.id)
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          {post.dislikes.length}
                        </span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleCommentForm(post.id)}
                        className="flex items-center space-x-2 group"
                      >
                        <MessageCircle
                          size={18}
                          className="text-gray-400 group-hover:text-gray-600"
                        />
                        <span className="text-sm text-gray-500">
                          {commentsCount[post.id] || 0}
                        </span>
                      </motion.button>
                    </div>

                    {profile?.id === authState.user?.id && (
                  
                        <Link 
                                to={`/edit-post/${post.id}`} 
                                className="absolute top-4 right-12 text-yellow-500 hover:text-yellow-600"
                            >
                                <FontAwesomeIcon icon={faEdit} size="lg" />
                            </Link>
                   
                    )}
                  </div>

                  <AnimatePresence>
                    {showCommentForm[post.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                        >
                        <CommentSection postId={post.id} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No posts yet</p>
                {profile?.id === authState.user?.id && (
                  <p className="text-gray-400 mt-2">
                    Share your thoughts with your followers
                  </p>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  </motion.div>
);
};
             
             
         



export default Profile;