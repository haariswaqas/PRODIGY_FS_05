import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FaSignInAlt, FaUserPlus, FaSignOutAlt, FaConnectdevelop, 
    FaUserFriends, FaComments, FaShieldAlt, FaRocket 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
        className="bg-white rounded-xl p-6 shadow-lg"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex flex-col items-center text-center">
            <Icon className="text-4xl text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    </motion.div>
);

const Home = () => {
    const { authState, dispatch } = useAuth();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700">
            {/* Hero Section */}
            <motion.section 
                className="relative pt-20 pb-32 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h1 
                            className="text-5xl md:text-6xl font-bold text-white mb-6"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Welcome to LinkWave
                        </motion.h1>
                        <motion.p 
                            className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            Connect, Share, and Engage with a Global Community of Like-minded Individuals
                        </motion.p>
                        
                        {!authState.isAuthenticated ? (
                            <motion.div 
                                className="flex flex-col sm:flex-row justify-center gap-4"
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition duration-300"
                                >
                                    <FaUserPlus className="mr-2" />
                                    Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-violet-600 transition duration-300"
                                >
                                    <FaSignInAlt className="mr-2" />
                                    Login
                                </Link>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="text-center"
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <p className="text-2xl text-white mb-4">Welcome back, {authState.user.username}!</p>
                                <Link
                                    to="/feed"
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition duration-300 mr-4"
                                >
                                    <FaRocket className="mr-2" />
                                    Go to Feed
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-300"
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={FaConnectdevelop}
                            title="Connect Globally"
                            description="Connect with people from around the world who share your interests and passions."
                        />
                        <FeatureCard
                            icon={FaUserFriends}
                            title="Build Communities"
                            description="Create and join communities around topics that matter to you."
                        />
                        <FeatureCard
                            icon={FaComments}
                            title="Engage in Discussions"
                            description="Share your thoughts and participate in meaningful conversations."
                        />
                        <FeatureCard
                            icon={FaShieldAlt}
                            title="Secure Platform"
                            description="Your privacy and security are our top priorities."
                        />
                    </div>
                </div>
            </motion.section>

            {/* Statistics Section */}
            <section className="bg-white bg-opacity-10 backdrop-blur-md py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <motion.div
                            className="p-6 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            <p className="text-4xl font-bold text-white mb-2">1M+</p>
                            <p className="text-gray-200">Active Users</p>
                        </motion.div>
                        <motion.div
                            className="p-6 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            <p className="text-4xl font-bold text-white mb-2">500K+</p>
                            <p className="text-gray-200">Daily Posts</p>
                        </motion.div>
                        <motion.div
                            className="p-6 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            <p className="text-4xl font-bold text-white mb-2">50K+</p>
                            <p className="text-gray-200">Communities</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Ready to join our growing community?
                    </h2>
                    <p className="text-gray-200 mb-8">
                        Start connecting with people who share your interests and passions today.
                    </p>
                    {!authState.isAuthenticated && (
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-gray-100 transition duration-300"
                        >
                            <FaUserPlus className="mr-2" />
                            Join LinkWave Now
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;