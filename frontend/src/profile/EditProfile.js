import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEnvelope, FaLock, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaGlobe, FaBirthdayCake } from 'react-icons/fa';

const EditProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isEditing = false, initialData = {} } = location.state || {};

    const [username, setUsername] = useState(initialData.username || '');
    const [email, setEmail] = useState(initialData.email || '');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState(initialData.first_name || '');
    const [lastName, setLastName] = useState(initialData.last_name || '');
    const [bio, setBio] = useState(initialData.bio || '');
    const [gender, setGender] = useState(initialData.gender || '');
    const [profilePicture, setProfilePicture] = useState(null);
    const [locationInput, setLocationInput] = useState(initialData.location || '');
    const [phoneNumber, setPhoneNumber] = useState(initialData.phone_number || '');
    const [website, setWebsite] = useState(initialData.website || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth || '');
    const [error, setError] = useState('');
    const { authState } = useAuth();

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const profileData = new FormData();
        profileData.append('username', username);
        profileData.append('email', email);
        
        // Only append password fields if not editing or if they are filled

            profileData.append('password', password);
            profileData.append('password2', password2); // Make sure to append password2 only if password is included
        profileData.append('first_name', firstName);
        profileData.append('last_name', lastName);
        profileData.append('bio', bio);
        profileData.append('gender', gender);
        if (profilePicture) profileData.append('profile_picture', profilePicture);
        profileData.append('location', locationInput);
        profileData.append('phone_number', phoneNumber);
        profileData.append('website', website);
        profileData.append('date_of_birth', dateOfBirth);

        try {
            const response = isEditing
               ? await fetch(`http://127.0.0.1:8000/api/profiles/${initialData.id}/edit/`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authState.token}`,
                    },
                    body: profileData,
                })
                : await fetch('http://127.0.0.1:8000/api/profiles/', {
                    method: 'POST',
                    body: profileData,
                });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            navigate(`/profile/${initialData.id || 'new'}`);
        } catch (error) {
            setError(error.message);
        }
        
        console.log([...profileData]); // Log the entries in FormData
    };

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
                className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full transform transition duration-300 hover:scale-105"
            >
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-center mb-6 text-white"
                >
                    <span className="text-blue-400">{isEditing ? "Edit Profile" : "Create Your Account"}</span>
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {!isEditing && (
                        <>
                            <div className="mb-4 flex items-center">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    id="passwordDisabled"
                                    type="text" // Change type to text to show password
                                    value={password} // Keep the password value
                                    placeholder="Password (disabled)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200 cursor-not-allowed" // Add some styles for disabled state
                                    disabled // Disable the input
                                />
                            </div>
                            <div className="mb-4 flex items-center">
                                <FaLock className="text-gray-400 mr-2" />
                                <input
                                    id="password2"
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4 flex items-center">
                        <FaIdCard className="text-gray-400 mr-2" />
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaIdCard className="text-gray-400 mr-2" />
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaGlobe className="text-gray-400 mr-2" />
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Bio"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <input
                            id="location"
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            placeholder="Location"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaPhoneAlt className="text-gray-400 mr-2" />
                        <input
                            id="phone"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaGlobe className="text-gray-400 mr-2" />
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Website"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <FaBirthdayCake className="text-gray-400 mr-2" />
                        <input
                            id="dateOfBirth"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4 flex items-center">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="col-span-2 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        {isEditing ? 'Update Profile' : 'Create Account'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditProfile;
