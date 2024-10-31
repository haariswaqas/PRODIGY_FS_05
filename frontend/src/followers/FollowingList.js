import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FollowingList = ({ profile }) => {
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');

  const fetchFollowing = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${profile.username}/following/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Following list');
      }

      const data = await response.json();
      setFollowing(data);

    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, [profile.username]);

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Following</h2>
      <ul className="space-y-4">
        {following.length > 0 ? (
          following.map((user, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center p-2 border-b border-gray-200"
            >
              <img 
                src={user.profile_picture || 'path/to/default/image.jpg'}
                alt={`${user.username}'s profile`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <Link 
                to={`/profile/${user.id}`} // Assuming `user.id` is the unique identifier
                className="text-gray-700 hover:text-blue-600"
              >
                {user.username}
              </Link>
            </motion.li>
          ))
        ) : (
          <li className="text-gray-600">No following users found.</li>
        )}
      </ul>
    </motion.div>
  );
};

export default FollowingList;
