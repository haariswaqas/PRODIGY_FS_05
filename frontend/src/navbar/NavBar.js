import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faBell, faSignInAlt, faUserPlus, faPen } from '@fortawesome/free-solid-svg-icons';

const NavBar = () => {
    const { authState, dispatch } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    const handleProfileClick = () => {
        if (authState.user) {
            navigate(`/profile/${authState.user.id}/`); // Navigate to the logged-in user's profile
        }
    };

    return (
        <nav className="bg-blue-800 shadow-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-white">
                            ConnectSphere
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8">
                        <Link to="/feed" className="text-blue-200 hover:text-white flex items-center">
                            <FontAwesomeIcon icon={faHome} className="mr-1" />
                            Home
                        </Link>
                        {authState.isAuthenticated && (
                            <button
                                onClick={handleProfileClick}
                                className="text-blue-200 hover:text-white flex items-center"
                            >
                                <FontAwesomeIcon icon={faUser} className="mr-1" />
                                Profile
                            </button>
                        )}
                        <Link to="/posts" className="text-blue-200 hover:text-white flex items-center">
                            <FontAwesomeIcon icon={faPen} className="mr-1" />
                            View Posts
                        </Link>
                        <Link to="/notifications" className="text-blue-200 hover:text-white flex items-center">
                            <FontAwesomeIcon icon={faBell} className="mr-1" />
                            Notifications
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {!authState.isAuthenticated ? (
                            <>
                                <Link to="/login">
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center">
                                        <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                        Login
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center">
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <span className="text-blue-200">Hello, {authState.user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition flex items-center"
                                >
                                    <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                    Logout
                                </button>
                                <Link to="/create_post">
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition flex items-center">
                                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                                        Post
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
