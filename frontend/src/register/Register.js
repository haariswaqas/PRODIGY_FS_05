import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    FaUser,
    FaCheckCircle,
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
    const [isUploaded, setIsUploaded] = useState(false);
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
    const RequiredLabel = ({ children }) => (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {children}<span className="text-red-500 ml-1">*</span>
        </label>
      );
    
      const OptionalLabel = ({ children }) => (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {children}
        </label>
      );
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
        if (e.target.files && e.target.files[0]) {
          setIsUploaded(true); // Set upload status to true once a file is selected
          // Handle the file as needed (e.g., upload, preview, etc.)
        }
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
    const InputField = ({ icon: Icon, ...props }) => (
      <div className="relative">
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
              {...props}
              className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
      </div>
  );

  const SelectField = ({ ...props }) => (
      <select
          {...props}
          className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
      />
  );
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex items-center justify-center px-4 py-12">
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
                  {isEditMode ? 'Edit Your Profile' : 'Create Account'}
              </h2>
              <p className="text-gray-200">
                  {isEditMode ? 'Update your information' : 'Begin your journey with us'}
              </p>
          </motion.div>

          {error && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500 bg-opacity-20 text-white p-4 rounded-lg mb-6"
              >
                  {error}
              </motion.div>
          )}

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-8 shadow-xl"
          >
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Account Section */}
                      <div className="col-span-full">
                          <h3 className="text-xl font-semibold text-white mb-4">Account Information</h3>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Username</label>
                          <InputField
                              icon={FaUserCircle}
                              id="username"
                              type="text"
                              value={formData.username}
                              onChange={handleChange}
                              required={!isEditMode}
                              disabled={isEditMode}
                              placeholder="Enter username"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Email</label>
                          <InputField
                              icon={FaEnvelope}
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required={!isEditMode}
                              placeholder="Enter email"
                          />
                      </div>

                      {!isEditMode && (
                          <>
                              <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
                                  <InputField
                                      icon={FaLock}
                                      id="password"
                                      type="password"
                                      value={formData.password}
                                      onChange={handleChange}
                                      required={!isEditMode}
                                      placeholder="Enter password"
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password</label>
                                  <InputField
                                      icon={FaLock}
                                      id="password2"
                                      type="password"
                                      value={formData.password2}
                                      onChange={handleChange}
                                      required={!isEditMode}
                                      placeholder="Confirm password"
                                  />
                              </div>
                          </>
                      )}

                      {/* Personal Information */}
                      <div className="col-span-full">
                          <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">First Name</label>
                          <InputField
                              icon={FaIdCard}
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              placeholder="Enter first name"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Last Name</label>
                          <InputField
                              icon={FaIdCard}
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              placeholder="Enter last name"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Gender</label>
                          <SelectField
                              id="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              required
                          >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                          </SelectField>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Date of Birth</label>
                          <InputField
                              icon={FaBirthdayCake}
                              id="dateOfBirth"
                              type="date"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              required
                          />
                      </div>

                      {/* Contact Information */}
                      <div className="col-span-full">
                          <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Phone Number</label>
                          <InputField
                              icon={FaPhoneAlt}
                              id="phoneNumber"
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="Enter phone number"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                          <InputField
                              icon={FaMapMarkerAlt}
                              id="locationInput"
                              type="text"
                              value={formData.locationInput}
                              onChange={handleChange}
                              placeholder="Enter location"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Website</label>
                          <InputField
                              icon={FaGlobe}
                              id="website"
                              type="url"
                              value={formData.website}
                              onChange={handleChange}
                              placeholder="Enter website URL"
                          />
                      </div>

                      <div className="col-span-full">
                          <label className="block text-sm font-medium text-gray-200 mb-2">Bio</label>
                          <textarea
                              id="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              placeholder="Tell us about yourself"
                              rows="4"
                              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                      </div>

                      <div className="col-span-full">
                          <label className="block text-sm font-medium text-gray-200 mb-2">Profile Picture</label>
                          <div className="flex items-center gap-4">
                              <label htmlFor="profilePicture" className="cursor-pointer">
                                  <input
                                      id="profilePicture"
                                      type="file"
                                      onChange={handleFileChange}
                                      className="hidden"
                                  />
                                  <motion.div
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="inline-flex items-center gap-2 px-4 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition duration-300"
                                  >
                                      <FaUser />
                                      Upload Photo
                                  </motion.div>
                              </label>
                              {isUploaded && (
                                  <div className="flex items-center gap-2 text-green-300">
                                      <FaCheckCircle />
                                      <span>Photo added!</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full mt-8 inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition duration-300 disabled:opacity-50"
                  >
                      {loading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Create Account')}
                  </motion.button>

                  {!isEditMode && (
                      <div className="text-center mt-6">
                          <p className="text-gray-200">
                              Already have an account?{' '}
                              <Link
                                  to="/login"
                                  className="text-violet-300 hover:text-violet-200 transition duration-300"
                              >
                                  Sign in here
                              </Link>
                          </p>
                      </div>
                  )}
              </form>
          </motion.div>
      </motion.div>
  </div>
    );
};

export default Register