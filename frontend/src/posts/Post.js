import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiFillCheckCircle } from 'react-icons/ai';
import { MdSend } from 'react-icons/md';
import { BiErrorCircle } from 'react-icons/bi';
import { useParams, useNavigate } from 'react-router-dom';

const Post = () => {
    const { authState } = useAuth();
    const { id } = useParams();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [shouldRemoveImage, setShouldRemoveImage] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const formVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    useEffect(() => {
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
                    setExistingImage(image);
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
        formData.append('is_public', isPublic);

        // Handle image cases
        if (image) {
            formData.append('image', image);
        } else if (shouldRemoveImage) {
            // If we're editing and want to remove the image
            formData.append('image', ''); // Send empty string to clear the image
        }

        try {
            const apiUrl = id ? `http://127.0.0.1:8000/api/posts/${id}/` : 'http://127.0.0.1:8000/api/posts/create/';
            
            let response;
            if (id) {
                // For editing, explicitly send the DELETE request first if removing image
                if (shouldRemoveImage && existingImage) {
                    try {
                        await axios.delete(`http://127.0.0.1:8000/api/posts/${id}/remove_image/`, {
                            headers: {
                                'Authorization': `Bearer ${authState.token}`,
                            },
                        });
                    } catch (err) {
                        console.error('Failed to remove image:', err);
                    }
                }
                
                // Then update the post
                response = await axios.put(apiUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${authState.token}`,
                    },
                });
            } else {
                // For new posts, just send the create request
                response = await axios.post(apiUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${authState.token}`,
                    },
                });
            }

            setSuccess(id ? 'Post updated successfully!' : 'Post created successfully!');
            
            // Reset all states
            setContent('');
            setImage(null);
            setImagePreview(null);
            setExistingImage(null);
            setShouldRemoveImage(false);
            setIsPublic(true);
            setError(null);

            // Navigate after a short delay
            setTimeout(() => {
                navigate('/posts');
            }, 2000);
        } catch (err) {
            console.error('Error:', err);
            setError(`Failed to ${id ? 'update' : 'create'} post. Please try again.`);
            setSuccess(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setExistingImage(null);
            setShouldRemoveImage(false);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        setShouldRemoveImage(true);
        setExistingImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    // Only show image if we have a new or existing image and we're not removing it
    const shouldShowImage = (imagePreview || existingImage) && !shouldRemoveImage;

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 p-4"
            initial="initial"
            animate="animate"
            variants={formVariants}
        >
            <motion.div
                className="bg-blue-600 p-10 rounded-2xl shadow-xl max-w-md w-full"
                transition={{ duration: 0.3 }}
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-white">
                    {id ? 'Edit Post' : 'New Post'}
                </h2>
                <form onSubmit={createOrEditPost} className="flex flex-col space-y-6">
                    <motion.textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full h-48 px-4 py-2 border border-blue-500 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-white bg-blue-800"
                        required
                    />
                    <div className="relative">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
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
                            {shouldShowImage ? 'Change Image' : 'Add Image'}
                        </motion.button>

                        {shouldShowImage && (
                            <div className="mt-6 relative">
                                <img
                                    src={imagePreview || existingImage}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-sm text-gray-300">
                            {isPublic ? 'Public' : 'Private (Only you can see)'}
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 w-full flex justify-center items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MdSend size={24} className="mr-2" />
                        {id ? 'Update Post' : 'Create Post'}
                    </motion.button>
                </form>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 text-red-400 flex items-center"
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
                        className="mt-6 text-green-400 flex items-center"
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