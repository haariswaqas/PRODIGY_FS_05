import React, { useState, useEffect } from 'react';
import SubComment from './SubComment'; // Adjust the import path if necessary

const SubCommentList = ({ commentId, userId }) => {
    const [subComments, setSubComments] = useState([]);
    const [error, setError] = useState(null);

    // Fetch subcomments for the specific comment when the component mounts
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
                setSubComments(data); // Set subcomments state with fetched data
            } catch (err) {
                setError(err.message);
            }
        };

        fetchSubComments();
    }, [commentId]);

    const handleSubCommentPosted = (newSubComment) => {
        setSubComments((prev) => [...prev, newSubComment]); // Add the new subcomment to the list
    };

    return (
        <div className="mt-4 flex justify-end"> {/* Align to the right */}
            <div className="max-w-sm w-full"> {/* Set a maximum width for the subcomment list */}
                <SubComment commentId={commentId} userId={userId} onSubCommentPosted={handleSubCommentPosted} />
                {error && <p className="text-red-500">{error}</p>}
                <div className="space-y-2 mt-2"> {/* Reduce the space between subcomments */}
                    {subComments.map((sub) => (
                        <div key={sub.id} className="bg-gray-100 p-1 rounded-lg flex items-start"> {/* Reduce padding */}
                            {/* User's Profile Picture and Username */}
                            <img 
                                src={sub.author?.profile_picture || 'default-avatar.png'} 
                                alt="Profile" 
                                className="h-6 w-6 rounded-full mr-2" // Smaller size
                            />
                            <div>
                                <div className="flex items-center">
                                    <span className="font-semibold text-gray-800 text-xs">
                                        {sub.author ? sub.author.username : 'Unknown User'}
                                    </span>
                                    <span className="text-gray-500 text-xs ml-2">{new Date(sub.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-700 text-xs mt-1">{sub.content}</p> {/* Smaller text size */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubCommentList;
