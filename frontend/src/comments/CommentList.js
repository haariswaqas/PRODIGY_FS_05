import React, { useState } from 'react';
import SubCommentList from '../subcomments/SubCommentList';

// Function to format the date
const formatDate = (dateString) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const CommentList = ({ comments, onCommentLike }) => {
    const [likedComments, setLikedComments] = useState(new Set()); // Track liked comments
    const [expandedCommentId, setExpandedCommentId] = useState(null); // Track which comment's subcomments are visible

    const handleLike = (commentId) => {
        setLikedComments((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId); // Unliked
            } else {
                newSet.add(commentId); // Liked
            }
            return newSet;
        });
        onCommentLike(commentId); // Call the like handler
    };

    const handleReplyClick = (commentId) => {
        setExpandedCommentId((prevId) => (prevId === commentId ? null : commentId)); // Toggle visibility
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">
                Comments ({comments.length})
            </h3>
            <div className="space-y-4">
                {/* Reverse the comments array to show the latest comment at the top */}
                {comments
                    .slice()
                    .reverse() // Reverse the comments array
                    .map((c) => (
                        <div key={c.id} className="bg-white shadow-md rounded-lg p-4 transition-transform transform hover:scale-105 hover:shadow-lg">
                            <div className="flex items-start mb-2">
                                <img 
                                    src={c.author?.profile_picture || 'default-avatar.png'} 
                                    alt="Profile" 
                                    className="h-10 w-10 rounded-full mr-3" 
                                />
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-800">
                                            {c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Unknown User'}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-2">{formatDate(c.created_at)}</span>
                                    </div>
                                    <p className="text-gray-700 mt-1">{c.content}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-300 mt-2 pt-2 text-gray-600 text-sm flex items-center">
                                <button 
                                    className={`hover:text-blue-500 transition duration-200`}
                                    onClick={() => handleLike(c.id)}
                                >
                                    {likedComments.has(c.id) ? 'Unlike' : 'Like'}
                                </button>
                                <span className="ml-2">{c.likes}</span> {/* Assuming likes is part of the comment data */}
                                <button 
                                    className="ml-4 hover:text-blue-500 transition duration-200" 
                                    onClick={() => handleReplyClick(c.id)}
                                >
                                    Reply
                                </button>
                            </div>

                            {/* Conditionally render SubCommentList based on expandedCommentId */}
                            {expandedCommentId === c.id && (
                                <SubCommentList commentId={c.id} userId={c.id.user} />
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default CommentList;