// SubComment.js
import React, { useState } from 'react';

const SubComment = ({ commentId, userId, onSubCommentPosted }) => {
    const [subComment, setSubComment] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!subComment.trim()) {
            setError('Subcomment cannot be empty');
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/subcomments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: subComment,
                    comment: commentId, // Include comment ID in the request body
                    user: userId // Optional, depending on your backend logic
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit the subcomment');
            }

            // Clear the subcomment input and reset error on success
            setSubComment('');
            setError(null); 

            // Trigger callback to notify parent about new subcomment
            const newSubComment = await response.json(); // Assuming the API returns the new subcomment
            onSubCommentPosted(newSubComment);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="subcomment-form mt-4">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={subComment}
                    onChange={(e) => setSubComment(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Write your reply here..."
                    rows="2"
                ></textarea>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className="text-right mt-2">
                    <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700">
                        Reply
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubComment;
