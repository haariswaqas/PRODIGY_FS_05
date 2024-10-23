import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { authState, dispatch } = useAuth();

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
                {!authState.isAuthenticated ? (
                    <>
                        <h2 className="text-3xl font-bold mb-4">Welcome to the Authentication System</h2>
                        <p className="mb-6 text-gray-600">Please login or register to continue</p>
                        <div className="flex justify-center">
                            <Link to="/login">
                                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 mr-2">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300">
                                    Register
                                </button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold mb-4">Welcome back, {authState.user.username}!</h2>
                        <p className="mb-6 text-gray-600">You are successfully logged in.</p>
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
