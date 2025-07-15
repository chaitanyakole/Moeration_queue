import React from 'react';
import { X, Check, ChevronLeft, ChevronRight, User, Clock, AlertTriangle } from 'lucide-react';

const ContentPreviewModal = ({ post, onClose, onApprove, onReject, posts, onNavigate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonColor = (reason) => {
    switch (reason.toLowerCase()) {
      case 'spam':
        return 'bg-yellow-100 text-yellow-800';
      case 'inappropriate content':
        return 'bg-red-100 text-red-800';
      case 'misinformation':
        return 'bg-purple-100 text-purple-800';
      case 'hate speech':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentIndex = posts.findIndex(p => p.id === post.id);
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < posts.length - 1;

  const handleNavigate = (direction) => {
    if (direction === 'prev' && canNavigatePrev) {
      onNavigate(posts[currentIndex - 1]);
    } else if (direction === 'next' && canNavigateNext) {
      onNavigate(posts[currentIndex + 1]);
    }
  };

  const isProcessed = post.status !== 'pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">Post Details</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(post.reportedReason)}`}>
                {post.reportedReason}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Navigation */}
              <button
                onClick={() => handleNavigate('prev')}
                disabled={!canNavigatePrev}
                className={`p-2 rounded-md ${
                  canNavigatePrev
                    ? 'text-gray-400 hover:text-gray-600'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {posts.length}
              </span>
              
              <button
                onClick={() => handleNavigate('next')}
                disabled={!canNavigateNext}
                className={`p-2 rounded-md ${
                  canNavigateNext
                    ? 'text-gray-400 hover:text-gray-600'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Post Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
            </div>

            {/* Post Meta */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-medium">Author:</span>
                <span className="ml-1">{post.author.username}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Reported:</span>
                <span className="ml-1">{formatDate(post.reportedAt)}</span>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                <span className="font-medium">Reports:</span>
                <span className="ml-1">{post.reportCount}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="bg-white border rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Post Content</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Report Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Reason:</span> {post.reportedReason}</p>
                  <p><span className="font-medium">Report Count:</span> {post.reportCount}</p>
                  <p><span className="font-medium">Status:</span> {post.status}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Author Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Username:</span> {post.author.username}</p>
                  <p><span className="font-medium">User ID:</span> {post.author.id}</p>
                </div>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {post.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Rejection Reason</h4>
                <p className="text-sm text-red-700">{post.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isProcessed && (
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onReject(post.id);
                  onClose();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => {
                  onApprove(post.id);
                  onClose();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewModal;