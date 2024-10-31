import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUser, faBell, faSignInAlt, faUserPlus, faPen, faBars, faTimes, faFeed
} from '@fortawesome/free-solid-svg-icons';
import { Transition } from '@headlessui/react';

const NavBar = () => {
    const { authState, dispatch } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const userId = authState.user?.id;

    const fetchProfile = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/profiles/${userId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
            setIsFollowing(data.is_following);
            setFollowersCount(data.followers.length);
            setFollowingCount(data.following.length);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [userId, authState.token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    const handleProfileClick = () => {
        if (profile) {
            navigate(`/profile/${profile.id}/`);
        }
    };

    const renderAuthButtons = () => {
        if (authState.isAuthenticated) {
            return (
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={handleProfileClick}
                        className="flex items-center space-x-2 text-white hover:bg-indigo-500 px-3 py-2 rounded-md transition duration-150 ease-in-out"
                    >
                        {profile?.profile_picture ? (
                            <img
                                src={profile.profile_picture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border-2 border-white"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faUser} className="text-xl" />
                        )}
                        <span className="font-medium">{authState.user.username}</span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out flex items-center space-x-1"
                    >
                        <FontAwesomeIcon icon={faSignInAlt} />
                        <span>Logout</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center space-x-3">
                <Link to="/login" className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition duration-150 ease-in-out flex items-center space-x-1">
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Login</span>
                </Link>
                <Link to="/register" className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition duration-150 ease-in-out flex items-center space-x-1">
                    <FontAwesomeIcon icon={faUserPlus} />
                    <span>Sign Up</span>
                </Link>
            </div>
        );
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/3665/3665969.png" 
                                alt="LinkWave Logo" 
                                className="w-8 h-8 transition-transform duration-200 hover:scale-110" 
                            />
                            <span className="text-2xl font-bold text-white hover:text-gray-100">
                                LinkWave
                            </span>
                        </Link>
                    </div>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/feed" className="text-gray-100 hover:text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center space-x-1">
                            <FontAwesomeIcon icon={faFeed} />
                            <span>Feed</span>
                        </Link>
                        <Link to="/posts" className="text-gray-100 hover:text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out flex items-center space-x-1">
                            <FontAwesomeIcon icon={faPen} />
                            <span>Posts</span>
                        </Link>
                        {authState.isAuthenticated && (
                            <Link to="/create_post" className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition duration-150 ease-in-out flex items-center space-x-1">
                                <FontAwesomeIcon icon={faPen} />
                                <span>Create Post</span>
                            </Link>
                        )}
                    </div>

                    {/* Right Side - Auth Buttons or Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {renderAuthButtons()}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;