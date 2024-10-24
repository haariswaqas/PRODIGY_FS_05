import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SubCommentList from '../subcomments/SubCommentList';

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
    const [likedComments, setLikedComments] = useState(new Set());
    const [expandedCommentId, setExpandedCommentId] = useState(null);

    const handleLike = (commentId) => {
        setLikedComments((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
            }
            return newSet;
        });
        onCommentLike(commentId);
    };

    const handleReplyClick = (commentId) => {
        setExpandedCommentId((prevId) => (prevId === commentId ? null : commentId));
    };

    // Sort the comments by created_at in ascending order
    const sortedComments = comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="mt-6 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
            <div className="space-y-3">
                {sortedComments.map((c) => (
                    <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white shadow-sm rounded-lg p-3 transition-transform transform hover:scale-105"
                    >
                        <div className="flex items-start mb-2">
                            <img 
                                src={c.author?.profile_picture || 'default-avatar.png'} 
                                alt="Profile" 
                                className="h-8 w-8 rounded-full mr-2 object-cover" 
                            />
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">
                                        {c.author ? `${c.author.first_name} ${c.author.last_name}` : 'Unknown User'}
                                    </span>
                                    <span className="text-gray-500 ml-2 text-xs">{formatDate(c.created_at)}</span>
                                </div>
                                <p className="text-sm mt-1">{c.content}</p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 mt-2 pt-2 text-gray-600 text-xs flex items-center justify-between">
                            <button 
                                className={`hover:text-blue-500 transition duration-200 ${likedComments.has(c.id) ? 'text-blue-500' : ''}`}
                                onClick={() => handleLike(c.id)}
                            >
                                {likedComments.has(c.id) ? 'Unlike' : 'Like'}
                            </button>
                            <span className="ml-2">{c.likes}</span>
                            <button 
                                className="hover:text-blue-500 transition duration-200"
                                onClick={() => handleReplyClick(c.id)}
                            >
                                Reply
                            </button>
                        </div>

                        {expandedCommentId === c.id && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="mt-2 bg-gray-50 p-2 rounded-lg shadow-sm"
                            >
                                <SubCommentList commentId={c.id} userId={c.id.user} />
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CommentList;