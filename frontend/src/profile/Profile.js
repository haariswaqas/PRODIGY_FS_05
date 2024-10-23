import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Comment from '../comments/Comment';

const Profile = () => {
  const { authState } = useAuth();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = authState.user?.id;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
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

return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-4"
    >
      <h2 className="text-3xl font-bold text-center mb-6">Profile</h2>
      {profile ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
              />
            ) : (
              <FaUserCircle size={128} color="#9CA3AF" className="mx-auto mb-4" />
            )}
            <h3 className="text-xl font-semibold">{profile.first_name} {profile.last_name}</h3>
            <p className="text-gray-600">@{profile.username}</p>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center text-sm">
                <span className="font-bold mr-1">{followersCount}</span> Followers
              </div>
              <div className="flex items-center text-sm">
                <span className="font-bold mr-1">{followingCount}</span> Following
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-100 p-4 rounded-lg shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-2">Bio</h4>
              <p>{profile.bio || 'No bio available'}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-100 p-4 rounded-lg shadow-sm"
            >
              <h4 className="text-lg font-semibold mb-2">Details</h4>
              <div className="space-y-2">
                <div>
                  <span className="font-bold mr-1">Location:</span> {profile.location || 'Not specified'}
                </div>
                <div>
                  <span className="font-bold mr-1">Phone Number:</span> {profile.phone_number || 'Not available'}
                </div>
                <div>
                  <span className="font-bold mr-1">Website:</span> {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  ) : 'No website available'}
                </div>
                <div>
                  <span className="font-bold mr-1">Date of Birth:</span> {profile.date_of_birth || 'Not provided'}
                </div>
                <div>
                  <span className="font-bold mr-1">Age:</span> {profile.age || 'Not specified'}
                </div>
                <div>
                  <span className="font-bold mr-1">Gender:</span> {profile.gender || 'Not specified'}
                </div>
              </div>
            </motion.div>
          </div>

          {profile.id !== authState.user.id && (
            <div className="mt-4 text-center">
              <button
                onClick={handleFollowUnfollow}
                className={`px-4 py-2 rounded-md transition duration-300 ${isFollowing ? 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white' : 'bg-blue-500 text-white hover:bg-blue-600'} flex items-center`}
              >
                {isFollowing ? (
                  <>
                    <FaCheckCircle size={18} className="mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={18} className="mr-2" />
                    Follow
                  </>
                )}
              </button>
            </div>
          )}

          {profile.id === authState.user.id && (
            <div className="mt-4 text-center">
              <Link to={`/edit-profile/${profile.id}/`} state={{ isEditing: true, initialData: profile }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                >
                  <FaEdit size={18} className="mr-2" />
                  Edit Profile
                </motion.button>
              </Link>
            </div>
          )}
          
          {/* Display user posts */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">Posts</h4>
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className="bg-gray-100 p-4 mb-2 rounded-lg shadow-sm">
  <h5 className="font-bold">{post.title}</h5>
  <p>{post.content}</p>
  <div className="flex items-center space-x-4">
    
    {/* Likes Section */}
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: post.dislikes.includes(authState.user?.id) ? 1 : 1.05 }} // Scale only when dislikes not active
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm text-gray-500 mb-1">
        {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
      </div>
      <button
        onClick={() => handleLike(post.id)}
        disabled={post.dislikes.includes(authState.user?.id)} // Disable if post is disliked
        className={`flex items-center px-4 py-2 rounded-md text-sm transition duration-300 ${
          post.likes.includes(authState.user?.id)
            ? 'bg-blue-500 text-white'
            : 'bg-white border border-gray-200 hover:bg-gray-100'
        } hover:text-blue-600`}
      >
        <FontAwesomeIcon
          icon={faThumbsUp}
          className={`mr-2 ${
            post.likes.includes(authState.user?.id) ? 'text-white' : 'text-blue-500'
          }`}
        />
        {post.likes.includes(authState.user?.id) ? 'Liked' : 'Like'}
      </button>
    </motion.div>

    {/* Dislikes Section */}
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: post.likes.includes(authState.user?.id) ? 1 : 1.05 }} // Scale only when likes not active
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-sm text-gray-500 mb-1">
        {post.dislikes.length} {post.dislikes.length === 1 ? 'dislike' : 'dislikes'}
      </div>
      <button
        onClick={() => handleDislike(post.id)}
        disabled={post.likes.includes(authState.user?.id)} // Disable if post is liked
        className={`flex items-center px-4 py-2 rounded-md text-sm transition duration-300 ${
          post.dislikes.includes(authState.user?.id)
            ? 'bg-red-500 text-white'
            : 'bg-white border border-gray-200 hover:bg-gray-100'
        } hover:text-red-600`}
      >
        <FontAwesomeIcon
          icon={faThumbsDown}
          className={`mr-2 ${
            post.dislikes.includes(authState.user?.id) ? 'text-white' : 'text-red-500'
          }`}
        />
        {post.dislikes.includes(authState.user?.id) ? 'Disliked' : 'Dislike'}
      </button>
    </motion.div>
  </div>
    {/* Comments Section */}
    <div className="flex items-center space-x-1">
                                <span className="text-gray-500">{commentsCount[post.id] || 0} Comments</span>
                                <button 
                                    onClick={() => handleToggleCommentForm(post.id)} 
                                    className="text-blue-500 hover:underline"
                                >
                                    <FontAwesomeIcon icon={faComment} />
                                </button>
                            </div>
                             {/* Comment Form Toggle */}
                        {showCommentForm[post.id] && (
                            <Comment postId={post.id} />
                        )}
</div>

              ))
            ) : (
              <p>No posts available.</p>
            )}
          </div>

        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </motion.div>
  );
};


export default Profile;
