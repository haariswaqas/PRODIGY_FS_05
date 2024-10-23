import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProfileList = () => {
    const { authState } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/profiles/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authState.token}`, // Ensure token is passed for authentication
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profiles');
                }
                const data = await response.json();
                console.log('Profiles:', data); // Log the fetched data
                setProfiles(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [authState.token]);

    if (loading) {
        return <div className="text-center">Loading profiles...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-6">Profiles</h2>
            {profiles.length > 0 ? (
                profiles.map(profile => (
                    <div key={profile.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
                        <div className="text-center">
                            {profile.profile_picture && (
                                <img
                                    src={profile.profile_picture}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full mx-auto mb-4"
                                />
                            )}
                            <h3 className="text-xl font-semibold">{profile.username}</h3>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>
                        <div className="mt-6">
                            <p><strong>Bio:</strong> {profile.bio || 'No bio available'}</p>
                            <p><strong>Location:</strong> {profile.location || 'Location not specified'}</p>
                            <p><strong>Phone Number:</strong> {profile.phone_number || 'Not available'}</p>
                            <p><strong>Website:</strong> {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a> : 'No website available'}</p>
                            <p><strong>Date of Birth:</strong> {profile.date_of_birth || 'Not provided'}</p>
                            <p><strong>Age:</strong> {profile.age || 'Not specified'}</p>
                            <p><strong>Gender:</strong> {profile.gender || 'Not specified'}</p>
                        </div>

                        {/* Show the edit button if the profile belongs to the logged-in user */}
                        {profile.user && profile.user.id === authState.user.id && ( // Safe access
                            <div className="mt-4 text-center">
                                <Link to={`/profiles/${profile.user.id}/edit`}>
                                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition">
                                        Edit Profile
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center">No profiles found</div>
            )}
        </div>
    );
};

export default ProfileList;
