import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card/Card';

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
    return (
      <div className="w-full max-w-md mx-auto p-4 rounded-lg bg-red-50 text-red-500 text-center">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-800">Following</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {following.length > 0 ? (
              following.map((user, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group"
                >
                  <Link 
                    to={`/profile/${user.id}`}
                    className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-indigo-100"
                  >
                    {user.profile_picture ? (
                      <img 
                        src={user.profile_picture}
                        alt={`${user.username}'s profile`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        {/* Replace with the icon component of your choice */}
                      </div>
                    )}
                    <div className="ml-4">
                      <p className="font-medium text-indigo-900 group-hover:text-indigo-700">
                        {user.username}
                      </p>
                    </div>
                  </Link>
                </motion.li>
              ))
            ) : (
              <li className="text-center py-8">
                <p className="text-indigo-600">No following users found.</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FollowingList;
