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
                    comment: commentId,
                    user: userId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit the subcomment');
            }

            setSubComment('');
            setError(null);

            const newSubComment = await response.json();
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
