import React, { useEffect, useState } from 'react';
import CompactPostForm from '../posts/CompactPostForm';
import PostsList from '../posts/PostsList';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
    const { authState } = useAuth(); // Get authentication state
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/posts/');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    const handlePostSuccess = () => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/posts/');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center">Feed</h2>
            <div className="flex flex-col space-y-6 md:space-y-8 lg:space-y-10">
                {authState.isAuthenticated ? ( // Check if user is authenticated
                    <>
                        <div className="flex justify-center">
                            <CompactPostForm onPostSuccess={handlePostSuccess} />
                        </div>
                        <PostsList posts={posts} />
                    </>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <p className="text-lg mb-4">Welcome to our application! Please log in to share your thoughts and see what others are saying.</p>
                        <p className="text-sm text-gray-600">Our application allows you to connect with friends, share posts, and engage with the community. Join us today!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
