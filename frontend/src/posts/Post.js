import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiFillCheckCircle } from 'react-icons/ai';
import { BiErrorCircle } from 'react-icons/bi';
import { useParams, useNavigate } from 'react-router-dom'; // If using React Router for id

const Post = () => {
    const { authState } = useAuth();
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null); // Existing image URL
    const [imagePreview, setImagePreview] = useState(null); // Preview state
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const formVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    // Fetch the post details if 'id' is present (for editing)
    useEffect(() => {
        // Fetch post data if editing an existing post
        if (id) {
            const fetchPostData = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/posts/${id}/`, {
                        headers: {
                            'Authorization': `Bearer ${authState.token}`,
                        },
                    });
                    const { content, image, is_public } = response.data;
                    setContent(content);
                    setExistingImage(image);  // Set the existing image URL
                    setIsPublic(is_public);
                } catch (err) {
                    setError('Failed to load post data.');
                }
            };
            fetchPostData();
        }
    }, [id, authState.token]);

    const createOrEditPost = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }
        formData.append('is_public', isPublic);

        try {
            const apiUrl = id
                ? `http://127.0.0.1:8000/api/posts/${id}/`   // Update existing post
                : 'http://127.0.0.1:8000/api/posts/create/'; // Create new post

            const method = id ? 'put' : 'post';

            const response = await axios({
                method: method,
                url: apiUrl,
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authState.token}`,
                },
            });

            setSuccess(id ? 'Post updated successfully!' : 'Post created successfully!');
            setContent(''); // Reset form
            setImage(null);
            setImagePreview(null); // Clear image preview
            setIsPublic(true);
            setError(null);

            // Optional: Redirect after success
            setTimeout(() => {
                navigate('/posts'); // Redirect to posts page after success
            }, 2000);

        } catch (err) {
            setError(`Failed to ${id ? 'update' : 'create'} post. Please try again.`);
            setSuccess(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file)); // Create a preview
        }
    };

    useEffect(() => {
        // Clean up the preview URL to avoid memory leaks
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4"
            initial="initial"
            animate="animate"
            variants={formVariants}
        >
            <motion.div
                className="bg-blue-700 p-10 rounded-2xl shadow-xl max-w-md w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-3xl font-bold mb-4 text-center text-white">
                    {id ? 'Edit Post' : 'New Post'}
                </h2>
                <form onSubmit={createOrEditPost} className="flex flex-col space-y-4">
                    <motion.textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full h-32 px-4 py-2 border border-blue-500 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-white bg-blue-800"
                        required
                    />
 <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
            />
            <motion.button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <AiOutlineCamera size={24} className="mr-2 text-white" />
                {/* Show "Change Image" if there is an existing image or a newly selected image, otherwise "Add Image" */}
                {existingImage || image ? 'Change Image' : 'Add Image'}
            </motion.button>

            {/* Show preview of newly selected image or existing image */}
            {(imagePreview || existingImage) && (
                <div className="mt-4">
                    <img
                        src={imagePreview || existingImage} // Show the preview if available, otherwise show the existing image
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                    />
                </div>
            )}
        </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-sm text-gray-300">Make this post public</label>
                    </div>

                    <motion.button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        {id ? 'Update Post' : 'Create Post'}
                    </motion.button>
                </form>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-red-400 flex items-center"
                    >
                        <BiErrorCircle size={24} className="mr-2 text-red-400" />
                        {error}
                    </motion.p>
                )}
                {success && (
                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 text-green-400 flex items-center"
                    >
                        <AiFillCheckCircle size={24} className="mr-2 text-green-400" />
                        {success}
                    </motion.p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Post;
