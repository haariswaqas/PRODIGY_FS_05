import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiFillCheckCircle } from 'react-icons/ai';
import { BiErrorCircle } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai'; // Import close icon

const CompactPostForm = ({ onPostSuccess }) => {
    const { authState } = useAuth();
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fileInputRef = useRef(null); // Create a ref for the file input

    const formVariants = {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }
        formData.append('is_public', isPublic);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/posts/create/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authState.token}`,
                },
            });

            setSuccess('Post created successfully!');
            onPostSuccess(); // Callback to notify parent component of success
            setContent('');
            setImage(null);
            setIsPublic(true);
            setError(null);
        } catch (err) {
            setError('Failed to create post. Please try again.');
            setSuccess(null);
            console.error(err); // Log the error for debugging
        }
    };

    const handleRemoveImage = () => {
        setImage(null); // Reset image state
    };

    return (
        <motion.div
            className="bg-blue-700 p-4 rounded-lg shadow-lg max-w-lg w-full mx-auto"
            initial="initial"
            animate="animate"
            variants={formVariants}
        >
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-20 px-2 py-2 border border-blue-500 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none text-black bg-white"
                    required
                />

                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef} // Set the ref to the file input
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setImage(file);
                        }}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()} // Use ref to trigger click
                        className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                        <AiOutlineCamera size={24} className="mr-2" />
                        Add Image
                    </button>
                    {image && (
                        <div className="mt-2 flex items-center justify-between">
                            <p className="text-green-300">
                                Image selected: {image.name}
                            </p>
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="ml-2 text-red-500 hover:text-red-700"
                            >
                                <AiOutlineClose size={20} />
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
                    <label className="text-sm text-gray-300">Public</label>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Post
                </button>
            </form>

            {error && (
                <p className="mt-4 text-red-400 flex items-center">
                    <BiErrorCircle size={24} className="mr-2" />
                    {error}
                </p>
            )}
            {success && (
                <p className="mt-4 text-green-400 flex items-center">
                    <AiFillCheckCircle size={24} className="mr-2" />
                    {success}
                </p>
            )}
        </motion.div>
    );
};

export default CompactPostForm;
