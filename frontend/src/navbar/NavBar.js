import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome, faUser, faBell, faSignInAlt, faUserPlus, faPen, faBars, faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { Transition } from '@headlessui/react';

const NavBar = () => {
    const { authState, dispatch } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/');
    };

    const handleProfileClick = () => {
        if (authState.user) {
            navigate(`/profile/${authState.user.id}/`);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-blue-800 to-purple-700 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="text-3xl font-bold text-white hover:text-gray-200">
                        ConnectSphere
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-white focus:outline-none"
                        >
                            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 text-white">
                        <Link to="/feed" className="hover:text-gray-200 flex items-center">
                            <FontAwesomeIcon icon={faHome} className="mr-1" />
                            Home
                        </Link>
                        <Link to="/posts" className="hover:text-gray-200 flex items-center">
                            <FontAwesomeIcon icon={faPen} className="mr-1" />
                            View Posts
                        </Link>
                        <Link to="/notifications" className="hover:text-gray-200 flex items-center">
                            <FontAwesomeIcon icon={faBell} className="mr-1" />
                            Notifications
                        </Link>
                        {authState.isAuthenticated && (
                            <>
                                <button onClick={handleProfileClick} className="hover:text-gray-200 flex items-center">
                                    <FontAwesomeIcon icon={faUser} className="mr-1" />
                                    Profile
                                </button>
                                <Link to="/create_post">
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
                                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                                        Post
                                    </button>
                                </Link>
                            </>
                        )}
                        {!authState.isAuthenticated ? (
                            <>
                                <Link to="/login">
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                                        <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                        Login
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition">
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <span>Hello, {authState.user.username}</span>
                                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition">
                                    <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <Transition
                show={isMobileMenuOpen}
                enter="transition duration-300 ease-out"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition duration-200 ease-in"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="md:hidden bg-gradient-to-r from-blue-800 to-purple-700 shadow-lg">
                    <div className="flex flex-col space-y-1 p-4 text-white">
                        <Link to="/feed" onClick={toggleMobileMenu} className="flex items-center py-2 hover:text-gray-200">
                            <FontAwesomeIcon icon={faHome} className="mr-2" />
                            Home
                        </Link>
                        <Link to="/posts" onClick={toggleMobileMenu} className="flex items-center py-2 hover:text-gray-200">
                            <FontAwesomeIcon icon={faPen} className="mr-2" />
                            View Posts
                        </Link>
                        <Link to="/notifications" onClick={toggleMobileMenu} className="flex items-center py-2 hover:text-gray-200">
                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                            Notifications
                        </Link>
                        {authState.isAuthenticated && (
                            <>
                                <button onClick={() => { handleProfileClick(); toggleMobileMenu(); }} className="flex items-center py-2 hover:text-gray-200">
                                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                                    Profile
                                </button>
                                <Link to="/create_post">
                                    <button className="bg-blue-500 text-white py-2 rounded-md hover:bg-purple-700 flex items-center w-full justify-center">
                                        <FontAwesomeIcon icon={faPen} className="mr-1" />
                                        Post
                                    </button>
                                </Link>
                            </>
                        )}
                        {!authState.isAuthenticated ? (
                            <>
                                <Link to="/login" onClick={toggleMobileMenu}>
                                    <button className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-full">
                                        <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                        Login
                                    </button>
                                </Link>
                                <Link to="/register" onClick={toggleMobileMenu}>
                                    <button className="bg-green-500 text-white py-2 rounded-md hover:bg-green-600 flex items-center justify-center w-full">
                                        <FontAwesomeIcon icon={faUserPlus} className="mr-1" />
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-3 py-4">
                                <span className="text-center">Hello, {authState.user.username}</span>
                                <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center w-full">
                                    <FontAwesomeIcon icon={faSignInAlt} className="mr-1" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Transition>
        </nav>
    );
};

export default NavBar;
