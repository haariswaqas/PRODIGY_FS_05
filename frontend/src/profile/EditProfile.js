import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUserCircle, FaCheckCircle, FaEnvelope, FaLock, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaGlobe, FaBirthdayCake, FaCamera } from 'react-icons/fa';

const EditProfile = () => {
    const location = useLocation();
    const [isUploaded, setIsUploaded] = useState(false);

  

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
        if (e.target.files && e.target.files[0]) {
            setIsUploaded(true);
            setProfilePicture(e.target.files[0]);
        }
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
                        {isEditing ? 'Edit Your Profile' : 'Create Your Account'}
                    </h2>
                    <p className="text-gray-200">
                        {isEditing ? 'Update your information below' : 'Fill in your details to get started'}
                    </p>
                </motion.div>

                {error && (
                    <div className="text-red-500 text-center mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="relative">
                        <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    {!isEditing && (
                        <>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    id="password2"
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="Confirm Password"
                                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                        </>
                    )}

                    <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full pl-4 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="relative">
                        <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Bio"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="location"
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            placeholder="Location"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="phone"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Website"
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <FaBirthdayCake className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            id="dob"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="profilePicture" className="relative cursor-pointer">
                            <input
                                id="profilePicture"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition duration-200">
                                <FaUserCircle className="text-white" />
                                Change Photo
                            </div>
                        </label>
                        {isUploaded && (
                            <div className="flex items-center gap-2 text-green-400">
                                <FaCheckCircle className="text-lg" />
                                <strong><span className="text-sm font-bold">Profile Picture Updated!</span>  </strong>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="col-span-1 sm:col-span-2 w-full py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition duration-200"
                    >
                        {isEditing ? 'Update Profile' : 'Create Account'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    </div>
    );
};

export default EditProfile;