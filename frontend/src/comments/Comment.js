import React, { useState, useEffect } from 'react';
import CommentList from './CommentList'; // Adjust the path if necessary
import { FaPaperPlane } from 'react-icons/fa'; // Import the "Send" icon from Font Awesome

const Comment = ({ postId, userId }) => {
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]); // State to hold the comments

    // Fetch comments for the post when the component mounts
    useEffect(() => {
        const fetchComments = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/posts/${postId}/comments/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token in the request
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }

                const data = await response.json();
                setComments(data); // Set comments state with fetched data
            } catch (err) {
                setError(err.message); // Set error state if there's an error
            }
        };

        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Get token for authenticated requests

        if (!comment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Include the token in the request
                },
                body: JSON.stringify({
                    content: comment,
                    post: postId, // Link comment to the post
                    user: userId, // Include userId if necessary in your backend
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit the comment');
            }

            // Clear the comment input and reset error on success
            const newComment = await response.json(); // Assuming the API returns the new comment
            setComments((prevComments) => [...prevComments, newComment]); // Add new comment to the state
            setComment(''); // Clear the input
            setError(null); // Reset error
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCommentLike = async (commentId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/like/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like the comment');
            }

            // Optionally, you could also update the comments state if needed
            const updatedComment = await response.json(); // Assuming the API returns the updated comment
            setComments((prevComments) =>
                prevComments.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="comment-form mt-4">
            <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
            <form onSubmit={handleSubmit} className="flex items-start space-x-2">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Write your comment here..."
                    rows="4"
                    style={{ width: '90%', minHeight: '100px' }} // Default size for the textarea
                ></textarea>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-700 flex items-center justify-center"
                    style={{ height: '40px', width: '40px' }}
                >
                    <FaPaperPlane />
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}

            {/* Pass comments and like handler to CommentList */}
            <CommentList comments={comments} onCommentLike={handleCommentLike} />
        </div>
    );
};

export default Comment;
