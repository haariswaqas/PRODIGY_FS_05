import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Home = () => {
    const { authState, dispatch } = useAuth();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Welcome to Social Connect!</h1>
                <p className="text-lg text-gray-200 mb-6">
                    {authState.isAuthenticated
                        ? `Welcome back, ${authState.user.username}!`
                        : 'Join the conversation. Please login or register to continue.'}
                </p>
                {!authState.isAuthenticated ? (
                    <div className="flex flex-col space-y-4">
                        <Link
                            to="/login"
                            className="flex items-center justify-center bg-blue-500 text-white text-lg font-semibold py-2 rounded-md shadow hover:bg-blue-600 transition duration-300"
                        >
                            <FaSignInAlt className="mr-2" />
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center justify-center bg-green-500 text-white text-lg font-semibold py-2 rounded-md shadow hover:bg-green-600 transition duration-300"
                        >
                            <FaUserPlus className="mr-2" />
                            Register
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center bg-red-500 text-white text-lg font-semibold py-2 px-3 rounded-md shadow hover:bg-red-600 transition duration-300"
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default Home;