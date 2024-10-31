import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Repeat2 } from 'lucide-react';

const Repost = ({ postId, reposted_from, originalPostContent, onRepostSuccess, repostCount = 0, isReposted = false }) => {
    const { authState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRepostedState, setIsRepostedState] = useState(isReposted);
    const [repostCountState, setRepostCountState] = useState(repostCount);

    const handleRepost = async (e) => {
        e.stopPropagation();
        setLoading(true);
        setError(null);

        try {
            if (!authState.isAuthenticated) {
                throw new Error('You must be logged in to repost.');
            }

            const response = await axios.post(
                'http://127.0.0.1:8000/api/posts/repost/',
                { post_id: postId },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );

            if (response.status === 201) {
                setIsRepostedState(true); // Explicitly set to true after successful repost
                setRepostCountState(repostCountState + 1);
                if (onRepostSuccess) {
                    onRepostSuccess(response.data);
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while reposting.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-start group">
            {reposted_from && (
                <div className="text-xs text-gray-500 mb-2">
                    <span>
                        Reposted by <strong>{authState.user.username}</strong> 
                    </span>
                </div>
            )}
            {reposted_from && (
                <div className="text-xs text-gray-500 flex items-center mb-2">
                    <div className="flex items-center mb-2">
                        <div className="flex-shrink-0">
                            <img 
                                src={reposted_from.author.profile_picture || 'default-avatar.png'} 
                                alt="Profile" 
                                className="h-10 w-10 rounded-full mr-2 border border-gray-200" 
                            />
                        </div>
                        <div>
                            <span>
                                Originally posted by <strong>{reposted_from.author.username}</strong> on{' '}
                                {new Date(reposted_from.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            {/* Display the original post content */}
            <div className="mt-2 text-sm text-gray-800">
                {originalPostContent}
            </div>
            <button
                onClick={handleRepost}
                disabled={loading}
                className={`flex items-center space-x-2 p-2 rounded-full 
                    hover:bg-green-50 group transition-colors duration-200
                    ${isRepostedState ? 'text-green-600' : 'text-gray-600'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={isRepostedState ? "Undo repost" : "Repost"}
            >
                <Repeat2 
                    className={`w-5 h-5 transition-transform duration-200 
                        ${isRepostedState ? 'text-green-600' : 'group-hover:text-green-600'} 
                        group-hover:scale-110`}
                />
                <span className={`text-sm ${isRepostedState ? 'text-green-600' : 'group-hover:text-green-600'}`}>
                    {repostCountState > 0 && repostCountState}
                </span>
            </button>
            {error && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Repost;
