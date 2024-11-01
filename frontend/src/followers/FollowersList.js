import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card/Card';
import { UserCircle } from 'lucide-react';

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
      <Card className="bg-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-purple-800">
            Followers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {followers.length > 0 ? (
              followers.map((follower, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="group"
                >
                  <Link 
                    to={`/profile/${follower.id}`}
                    className="flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-purple-100"
                  >
                    {follower.profile_picture ? (
                      <img 
                        src={follower.profile_picture}
                        alt={`${follower.username}'s profile`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-purple-500" />
                      </div>
                    )}
                    <div className="ml-4">
                      <p className="font-medium text-purple-900 group-hover:text-purple-700">
                        {follower.username}
                      </p>
                    </div>
                  </Link>
                </motion.li>
              ))
            ) : (
              <li className="text-center py-8">
                <p className="text-purple-600">No followers yet</p>
                <p className="text-sm text-purple-400 mt-1">When people follow you, they'll appear here</p>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FollowersList;