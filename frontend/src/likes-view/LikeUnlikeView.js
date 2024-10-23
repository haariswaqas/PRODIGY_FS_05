// LikeUnlikeView.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const LikeUnlikeView = ({ post, authState, handleLike, handleDislike }) => {
    const isLiked = post.likes.includes(authState.user?.id);
    const isDisliked = post.dislikes.includes(authState.user?.id);

    return (
        <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center ${isLiked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600`}
            >
                <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                <span>{post.likes.length}</span>
            </button>

            {/* Dislike Button */}
            <button
                onClick={() => handleDislike(post.id)}
                className={`flex items-center ${isDisliked ? 'text-red-500' : 'text-gray-500'} hover:text-red-600`}
            >
                <FontAwesomeIcon icon={faThumbsDown} className="mr-1" />
                <span>{post.dislikes.length}</span>
            </button>
        </div>
    );
};

export default LikeUnlikeView;
