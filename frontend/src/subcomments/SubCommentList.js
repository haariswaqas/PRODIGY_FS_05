import React, { useState, useEffect } from 'react';
import SubComment from './SubComment'; // Adjust the import path if necessary

const SubCommentList = ({ commentId, userId }) => {
    const [subComments, setSubComments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubComments = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/comments/${commentId}/subcomments/list/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch subcomments');
                }

                const data = await response.json();
                setSubComments(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchSubComments();
    }, [commentId]);

    const handleSubCommentPosted = (newSubComment) => {
        setSubComments((prev) => [...prev, newSubComment]);
    };

    const handleLike = async (subCommentId, liked) => {
        const token = localStorage.getItem('token');
        const method = liked ? 'DELETE' : 'POST'; // DELETE to unlike, POST to like

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/subcomments/${subCommentId}/like/`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to like/unlike subcomment');
            }

            // Update the local state to reflect the like/unlike action
            setSubComments((prevSubComments) =>
                prevSubComments.map((sub) => 
                    sub.id === subCommentId ? { ...sub, liked: !liked, likeCount: sub.liked ? sub.likeCount - 1 : sub.likeCount + 1 } : sub
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="mt-4 flex justify-end">
            <div className="max-w-sm w-full">
                <SubComment commentId={commentId} userId={userId} onSubCommentPosted={handleSubCommentPosted} />
                {error && <p className="text-red-500">{error}</p>}
                <div className="space-y-2 mt-2">
                    {subComments.map((sub) => (
                        <div key={sub.id} className="bg-gray-100 p-1 rounded-lg flex items-start">
                            <img 
                                src={sub.author?.profile_picture || 'default-avatar.png'} 
                                alt="Profile" 
                                className="h-6 w-6 rounded-full mr-2" 
                            />
                            <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800 text-xs">
                                        {sub.author ? sub.author.username : 'Unknown User'}
                                    </span>
                                    <span className="text-gray-500 text-xs ml-2">{new Date(sub.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-700 text-xs mt-1">{sub.content}</p>
                                <div className="flex items-center mt-2">
                                    <button
                                        onClick={() => handleLike(sub.id, sub.liked)}
                                        className={`text-xs ${sub.liked ? 'text-blue-500' : 'text-gray-500'}`}
                                    >
                                        {sub.liked ? 'Unlike' : 'Like'} ({sub.likeCount || 0})
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubCommentList;
