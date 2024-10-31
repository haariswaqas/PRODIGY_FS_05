import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


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

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-8">
            <h2 className="text-3xl font-bold text-white text-center">
              {isEditMode ? 'Edit Profile' : 'Create Your Account'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Account Information Section */}
              <div className="col-span-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Account Information
                </h3>
              </div>

              <div>
                <RequiredLabel>Username</RequiredLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUserCircle className="text-gray-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isEditMode}
                    disabled={isEditMode}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <RequiredLabel>Email</RequiredLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required={!isEditMode}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {!isEditMode && (
                <>
                  <div>
                    <RequiredLabel>Password</RequiredLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditMode}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <div>
                    <RequiredLabel>Confirm Password</RequiredLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        id="password2"
                        type="password"
                        value={formData.password2}
                        onChange={handleChange}
                        required={!isEditMode}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Personal Information Section */}
              <div className="col-span-full mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Personal Information
                </h3>
              </div>

              <div>
                <RequiredLabel>First Name</RequiredLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div>
                <RequiredLabel>Last Name</RequiredLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <RequiredLabel>Gender</RequiredLabel>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <RequiredLabel>Date of Birth</RequiredLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBirthdayCake className="text-gray-400" />
                  </div>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="col-span-full mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Contact Information
                </h3>
              </div>

              <div>
                <OptionalLabel>Phone Number</OptionalLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhoneAlt className="text-gray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <OptionalLabel>Location</OptionalLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    id="locationInput"
                    type="text"
                    value={formData.locationInput}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div>
                <OptionalLabel>Website</OptionalLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGlobe className="text-gray-400" />
                  </div>
                  <input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <OptionalLabel>Bio</OptionalLabel>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              </div>

              <div className="col-span-full">
                <OptionalLabel>Profile Picture</OptionalLabel>
                <div className="mt-1 flex items-center gap-4">
    <label htmlFor="profilePicture" className="relative cursor-pointer">
      <input
        id="profilePicture"
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
        <FaUser className="text-white" />
        Upload Photo
      </div>
    </label>
    
    {isUploaded && (
      <div className="flex items-center gap-2 text-green-600">
        <FaCheckCircle className="text-lg" />
        <span className="text-sm font-medium">Photo added!</span>
      </div>
    )}
  </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isEditMode ? 'Save Changes' : 'Create Account')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    );
};

export default Register