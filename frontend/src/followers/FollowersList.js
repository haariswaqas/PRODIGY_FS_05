import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FollowersList = ({ profile }) => {
  const [followers, setFollowers] = useState([]);
  const [error, setError] = useState('');

  const fetchFollowers = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${profile.username}/followers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Followers');
      }

      const data = await response.json();
      setFollowers(data);

    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchFollowers();
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-left">Followers</h2>
      <ul className="space-y-4 text-left">
        {followers.length > 0 ? (
          followers.map((follower, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-center p-2 border-b border-gray-200"
            >
              <img 
                src={follower.profile_picture || 'path/to/default/image.jpg'}
                alt={`${follower.username}'s profile`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="text-gray-700">{follower.username}</span>
            </motion.li>
          ))
        ) : (
          <li className="text-gray-600">No followers found.</li>
        )}
      </ul>
    </motion.div>
  );
};

export default FollowersList;
