import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setFilter, 
  selectPost, 
  selectAllPosts, 
  clearSelection, 
  approvePost, 
  rejectPost, 
  batchApprove, 
  batchReject,
  undoAction
} from '../store';
import PostList from './PostList';
import ContentPreviewModal from './ContentPreviewModal ';
import ConfirmationDialog from './ConfirmationDialog';
import { Check, X, Eye, CheckSquare, Square, AlertCircle } from 'lucide-react';

const ModerationQueue = ({ showToast }) => {
  const dispatch = useDispatch();
  const { posts, selectedPosts, currentFilter, undoStack } = useSelector(state => state.posts);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter posts based on current filter
  const filteredPosts = posts.filter(post => post.status === currentFilter);
  const statusCounts = {
    pending: posts.filter(p => p.status === 'pending').length,
    approved: posts.filter(p => p.status === 'approved').length,
    rejected: posts.filter(p => p.status === 'rejected').length
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          if (selectedPosts.length > 0) {
            handleBatchApprove();
          }
          break;
        case 'r':
          e.preventDefault();
          if (selectedPosts.length > 0) {
            handleBatchReject();
          }
          break;
        case ' ':
          e.preventDefault();
          if (selectedPosts.length === 1) {
            const post = posts.find(p => p.id === selectedPosts[0]);
            if (post) setSelectedPostForPreview(post);
          }
          break;
        case 'escape':
          e.preventDefault();
          if (selectedPostForPreview) {
            setSelectedPostForPreview(null);
          } else if (selectedPosts.length > 0) {
            dispatch(clearSelection());
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPosts, selectedPostForPreview, dispatch, posts]);

  const handleFilterChange = (filter) => {
    dispatch(setFilter(filter));
  };

  const handlePostSelect = (postId) => {
    dispatch(selectPost(postId));
  };

  const handleSelectAll = () => {
    dispatch(selectAllPosts());
  };

  const handleApprove = (postId) => {
    dispatch(approvePost(postId));
    showToast('Post approved successfully', 'success', {
      label: 'Undo',
      onClick: () => {
        const lastAction = undoStack.find(a => a.postId === postId && a.type === 'approve');
        if (lastAction) {
          dispatch(undoAction(lastAction));
          showToast('Action undone', 'info');
        }
      }
    });
  };

  const handleReject = (postId, reason = '') => {
    dispatch(rejectPost({ postId, reason }));
    showToast('Post rejected', 'error', {
      label: 'Undo',
      onClick: () => {
        const lastAction = undoStack.find(a => a.postId === postId && a.type === 'reject');
        if (lastAction) {
          dispatch(undoAction(lastAction));
          showToast('Action undone', 'info');
        }
      }
    });
  };

  const handleBatchApprove = () => {
    if (selectedPosts.length === 0) return;
    
    setConfirmAction({
      type: 'batchApprove',
      postIds: selectedPosts,
      message: `Are you sure you want to approve ${selectedPosts.length} post(s)?`
    });
    setShowConfirmDialog(true);
  };

  const handleBatchReject = () => {
    if (selectedPosts.length === 0) return;
    
    setConfirmAction({
      type: 'batchReject',
      postIds: selectedPosts,
      message: `Are you sure you want to reject ${selectedPosts.length} post(s)?`
    });
    setShowConfirmDialog(true);
  };

  const confirmDialogAction = () => {
    if (confirmAction.type === 'batchApprove') {
      dispatch(batchApprove(confirmAction.postIds));
      showToast(`${confirmAction.postIds.length} posts approved`, 'success');
    } else if (confirmAction.type === 'batchReject') {
      dispatch(batchReject({ postIds: confirmAction.postIds, reason: rejectionReason }));
      showToast(`${confirmAction.postIds.length} posts rejected`, 'error');
    }
    
    setShowConfirmDialog(false);
    setConfirmAction(null);
    setRejectionReason('');
  };

  const allSelected = filteredPosts.length > 0 && selectedPosts.length === filteredPosts.length;
  const someSelected = selectedPosts.length > 0;

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentFilter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                currentFilter === status
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Batch Actions */}
      {filteredPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Select All</span>
              </button>
              
              {someSelected && (
                <span className="text-sm text-gray-600">
                  {selectedPosts.length} selected
                </span>
              )}
            </div>

            {someSelected && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBatchApprove}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve ({selectedPosts.length})
                </button>
                <button
                  onClick={handleBatchReject}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject ({selectedPosts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <div className="text-sm text-blue-800">
            <strong>Keyboard Shortcuts:</strong> 
            <span className="ml-2">A = Approve | R = Reject | Space = Preview | Escape = Cancel/Deselect</span>
          </div>
        </div>
      </div>

      {/* Post List */}
      <PostList
        posts={filteredPosts}
        selectedPosts={selectedPosts}
        onPostSelect={handlePostSelect}
        onPostPreview={setSelectedPostForPreview}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Content Preview Modal */}
      {selectedPostForPreview && (
        <ContentPreviewModal
          post={selectedPostForPreview}
          onClose={() => setSelectedPostForPreview(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          posts={filteredPosts}
          onNavigate={setSelectedPostForPreview}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setConfirmAction(null);
            setRejectionReason('');
          }}
          onConfirm={confirmDialogAction}
          title={confirmAction?.type === 'batchApprove' ? 'Confirm Approval' : 'Confirm Rejection'}
          message={confirmAction?.message}
          confirmText={confirmAction?.type === 'batchApprove' ? 'Approve' : 'Reject'}
          confirmButtonClass={confirmAction?.type === 'batchApprove' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          showReasonInput={confirmAction?.type === 'batchReject'}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
        />
      )}
    </div>
  );
};

export default ModerationQueue;