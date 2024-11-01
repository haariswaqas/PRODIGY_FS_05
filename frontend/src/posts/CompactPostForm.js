import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AiOutlineCamera, AiFillCheckCircle } from 'react-icons/ai';
import { MdSend } from 'react-icons/md';
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
    className="bg-blue-800 p-6 rounded-lg shadow-2xl max-w-md w-full mx-auto"
    initial="initial"
    animate="animate"
    variants={formVariants}
>
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-24 p-3 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 bg-white placeholder-gray-400"
            required
        />

        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                    const file = e.target.files[0];
                    setImage(file);
                }}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
                <AiOutlineCamera size={20} className="mr-2" />
                Add Image
            </button>
            {image && (
                <div className="mt-2 flex items-center justify-between bg-blue-100 p-2 rounded-lg text-gray-700">
                    <p className="text-sm">
                        <strong>Image selected:</strong> {image.name}
                    </p>
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700 ml-2"
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
                className="mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
            />
            <label className="text-sm text-gray-200">
                {isPublic ? 'Public' : 'Private (Only you can see)'}
            </label>
        </div>

        <motion.button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 w-full flex justify-center items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <MdSend size={20} className="mr-2" />
            Create Post
        </motion.button>
    </form>

    {error && (
        <p className="mt-4 text-red-400 flex items-center">
            <BiErrorCircle size={20} className="mr-2" />
            {error}
        </p>
    )}
    {success && (
        <p className="mt-4 text-green-400 flex items-center">
            <AiFillCheckCircle size={20} className="mr-2" />
            {success}
        </p>
    )}
</motion.div>

    );
};

export default CompactPostForm;