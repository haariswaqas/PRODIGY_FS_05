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
        location: '',
        phoneNumber: '',
        website: '',
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
                        location: userData.location || '',
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
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex items-center justify-center px-7">
      <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex items-center justify-center px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            {isEditMode ? 'Edit Your Profile' : 'Create Your Account'}
          </h2>
          <p className="text-gray-200">
            {isEditMode ? 'Update your information below' : 'Fill in your details to get started'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-xl"
        >
          {error && (
            <div className="text-red-300 text-center mb-6 bg-red-500 bg-opacity-10 rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Username
              </label>
              <div className="relative">
                <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isEditMode}
                  disabled={isEditMode}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required={!isEditMode}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {!isEditMode && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditMode}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="password2"
                      type="password"
                      value={formData.password2}
                      onChange={handleChange}
                      required={!isEditMode}
                      className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                First Name
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Last Name
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="" className="text-gray-700">Select Gender</option>
                <option value="male" className="text-gray-700">Male</option>
                <option value="female" className="text-gray-700">Female</option>
                <option value="other" className="text-gray-700">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Location
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your location"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Website
              </label>
              <div className="relative">
                <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Your website URL"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Profile Picture
              </label>
              <input
                id="profilePicture"
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-500 file:text-white hover:file:bg-violet-600"
              />
            </div>

            <div className="col-span-2">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition duration-300 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Create Account')}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </motion.div>
    </div>

    );
};

export default Register