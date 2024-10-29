import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaLock, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaGlobe, 
  FaBirthdayCake 
} from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const { userId } = useParams(); // Get userId from URL if editing
    const isEditMode = Boolean(userId);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        firstName: '',
        lastName: '',
        bio: '',
        gender: '',
        profilePicture: null,
        locationInput: '',
        phoneNumber: '',
        website: null,
        dateOfBirth: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch user data if in edit mode
        const fetchUserData = async () => {
            if (isEditMode) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://127.0.0.1:8000/api/profiles/${userId}/`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        }
                    });
                    
                    // Update form data with user data
                    const userData = response.data;
                    console.log('Fetched User Data:', userData); // Log the user data
                    setFormData({
                        username: userData.username || '',
                        email: userData.email || '',
                        password: '',
                        password2: '',
                        firstName: userData.first_name || '',
                        lastName: userData.last_name || '',
                        bio: userData.bio || '',
                        gender: userData.gender || '',
                        locationInput: userData.location || '',
                        phoneNumber: userData.phone_number || '',
                        website: userData.website || '',
                        dateOfBirth: userData.date_of_birth || '',
                        profilePicture: null,
                    });
                } catch (err) {
                    setError('Failed to fetch user data');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [isEditMode, userId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            profilePicture: e.target.files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            return;
        }

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== '') {
                if (key === 'profilePicture' && formData[key]) {
                    submitData.append('profile_picture', formData[key]);
                } else {
                    submitData.append(key.replace(/([A-Z])/g, '_$1').toLowerCase(), formData[key]);
                }
            }
        });

        try {
            setLoading(true);
            if (isEditMode) {
                // PUT request for editing
                await axios.put(
                    `http://127.0.0.1:8000/api/profiles/${userId}/edit/`,
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                navigate('/profile');
            } else {
                // POST request for registration
                await axios.post(
                    'http://127.0.0.1:8000/api/register/',
                    submitData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                navigate('/login');
            }
        } catch (error) {
            setError(
                error.response?.data?.detail || 
                error.response?.data?.message || 
                'Operation failed'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-blue-500">Loading...</div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-blue-800"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full"
            >
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-center mb-6"
                >
                    <span className="text-blue-400">
                        {isEditMode ? 'Edit Profile' : 'Create Your Account'}
                    </span>
                </motion.h2>

                {error && (
                    <div className="text-red-500 text-center mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="mb-4 flex items-center">
                        <FaUserCircle className="text-gray-400 mr-2" />
                        <input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            required={!isEditMode}
                            disabled={isEditMode}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required={!isEditMode}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Only show password fields for registration */}
                    {!isEditMode && (
                        <>
                            <div className="mb-4 flex items-center">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required={!isEditMode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="mb-4 flex items-center">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    id="password2"
                                    type="password"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    placeholder="Confirm Password"
                                    required={!isEditMode}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Rest of the form fields... */}
                    <div className="mb-4 flex items-center">
                        <FaIdCard className="text-gray-400 mr-2" />
                        <input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaIdCard className="text-gray-400 mr-2" />
                        <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <select
                            id="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center">
                        <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Bio"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <input
                            id="locationInput"
                            type="text"
                            value={formData.locationInput}
                            onChange={handleChange}
                            placeholder="Location"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaPhoneAlt className="text-gray-400 mr-2" />
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaGlobe className="text-gray-400 mr-2" />
                        <input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="Website"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaBirthdayCake className="text-gray-400 mr-2" />
                        <input
                            id="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            id="profilePicture"
                            type="file"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Register')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Register