import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams} from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

import FollowersList from '../followers/FollowersList';
import FollowingList from '../followers/FollowingList';
import CommentSection from '../comments/CommentSection';

const Profile = () => {
  const { authState } = useAuth();
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <div className="flex justify-center mt-4">
              <button
                className={`px-4 py-2 rounded-lg ${isFollowing ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                onClick={handleFollowUnfollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </div>
            <div className="flex justify-center mt-2">
              <button onClick={toggleFollowers} className="text-blue-500 underline">
                {followersCount} Followers
              </button>
              <button onClick={toggleFollowing} className="text-blue-500 underline ml-4">
                {followingCount} Following
              </button>
            </div>
            {showFollowers && <FollowersList followers={profile.followers} />}
            {showFollowing && <FollowingList following={profile.following} />}
          </div>

          <h3 className="text-2xl font-semibold mt-6">Posts</h3>
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border-b border-gray-300 py-4">
                <h4 className="font-semibold">{post.title}</h4>
                <p>{post.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <button onClick={() => handleLike(post.id)}>
                      <FontAwesomeIcon icon={faThumbsUp} className={`${post.likes.includes(authState.user?.id) ? 'text-blue-500' : ''}`} />
                      {post.likes.length}
                    </button>
                    <button onClick={() => handleDislike(post.id)} className="ml-4">
                      <FontAwesomeIcon icon={faThumbsDown} className={`${post.dislikes.includes(authState.user?.id) ? 'text-red-500' : ''}`} />
                      {post.dislikes.length}
                    </button>
                    <button onClick={() => handleToggleCommentForm(post.id)} className="ml-4">
                      <FontAwesomeIcon icon={faComment} />
                      {commentsCount[post.id] || 0}
                    </button>
                  </div>
                </div>
                {showCommentForm[post.id] && <CommentSection postId={post.id} />}
              </div>
            ))
          )}
        </div>
      ) : (
        loading ? <p>Loading...</p> : <p>No profile found.</p>
      )}
    </motion.div>
  );
};

export default Profile;
