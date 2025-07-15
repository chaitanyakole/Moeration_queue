import React, { useState, useEffect } from 'react';

const PostModal = ({ post, posts, onClose, onApprove, onReject }) => {
  const [currentPost, setCurrentPost] = useState(post);
  const [currentIndex, setCurrentIndex] = useState(posts.findIndex(p => p.id === post.id));

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePost(-1);
          break;
        case 'ArrowRight':
          navigatePost(1);
          break;
        case 'a':
        case 'A':
          if (currentPost.status === 'pending') {
            onApprove(currentPost.id);
          }
          break;
        case 'r':
        case 'R':
          if (currentPost.status === 'pending') {
            onReject(currentPost.id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPost, onClose, onApprove, onReject]);

  const navigatePost = (direction) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < posts.length) {
      setCurrentIndex(newIndex);
      setCurrentPost(posts[newIndex]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Post Details</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(currentPost.status)}`}>
              {currentPost.status}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {posts.length}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;