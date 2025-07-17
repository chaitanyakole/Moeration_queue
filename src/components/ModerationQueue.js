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
import { Check, X, Eye, CheckSquare, Square, AlertCircle, XCircle, ChevronLeft, ChevronRight, Clock as ClockIcon } from 'lucide-react';

const ModerationQueue = ({ showToast }) => {
  const dispatch = useDispatch();
  const { posts, selectedPosts, currentFilter, undoStack } = useSelector(state => state.posts);
  const [selectedPostForPreview, setSelectedPostForPreview] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Filter posts based on current filter and search
  const filteredPosts = posts.filter(post => {
    const matchesStatus = post.status === currentFilter;
    const matchesSearch =
      debouncedSearch.trim() === '' ||
      post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (post.author && post.author.username && post.author.username.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);
  
  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilter]);

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
        case 'c':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            // Ctrl+C for select all
            handleSelectAll();
          } else {
            // Just 'C' for clear selection
            handleClearSelection();
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
    // Select all posts on current page
    const currentPagePostIds = currentPosts.map(post => post.id);
    currentPagePostIds.forEach(postId => {
      if (!selectedPosts.includes(postId)) {
        dispatch(selectPost(postId));
      }
    });
  };

  const handleSelectAllPages = () => {
    // Select all posts across all pages
    dispatch(selectAllPosts());
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
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

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePostsPerPageChange = (newPostsPerPage) => {
    setPostsPerPage(newPostsPerPage);
    setCurrentPage(1); // Reset to first page when changing posts per page
  };

  const allSelected = currentPosts.length > 0 && currentPosts.every(post => selectedPosts.includes(post.id));
  const someSelected = selectedPosts.length > 0;

  return (
    <div className="space-y-6">
      {/* Status Tabs + Search */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2 shadow-md transition-shadow duration-300">
        <nav className="relative -mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          {Object.entries(statusCounts).map(([status, count], idx) => {
            let icon = null;
            if (status === 'pending') icon = <ClockIcon className="h-4 w-4 mr-1 text-yellow-500" />;
            if (status === 'approved') icon = <Check className="h-4 w-4 mr-1 text-green-500" />;
            if (status === 'rejected') icon = <X className="h-4 w-4 mr-1 text-red-500" />;
            const isActive = currentFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`relative flex items-center py-2 px-3 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/80 ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-white/60 hover:border-blue-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {count}
                </span>
                {/* Animated underline indicator */}
                {isActive && (
                  <span className="absolute left-2 right-2 -bottom-1 h-1 bg-blue-500 rounded transition-all duration-300" />
                )}
              </button>
            );
          })}
        </nav>
        {/* Divider on mobile */}
        <div className="block sm:hidden h-px bg-gray-200 my-2 w-full" />
        <div className="flex items-center relative w-full sm:w-auto mt-2 sm:mt-0">
          <span className="absolute left-3 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" /></svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="border border-gray-300 rounded-md pl-9 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 bg-white shadow-sm transition-all duration-200 focus:bg-blue-50"
            style={{ minWidth: 0 }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-gray-400 hover:text-white hover:bg-blue-400 rounded-full p-1 focus:outline-none transition-colors duration-150"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              tabIndex={-1}
              aria-label="Clear search"
            >
              &#10005;
            </button>
          )}
        </div>
      </div>

     

     

      {/* Keyboard Shortcuts Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
          <div className="text-sm text-blue-800">
            <strong>Keyboard Shortcuts:</strong> 
            <span className="ml-2">A = Approve | R = Reject | Ctrl+C = Select All | C = Clear Selection | Space = Preview | Escape = Cancel/Deselect</span>
          </div>
        </div>
      </div>
      
 {/* Batch Actions */}
 {filteredPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-5">
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
                <span>Select Page</span>
              </button>
              
              <button
                onClick={handleSelectAllPages}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Select All ({filteredPosts.length})</span>
              </button>
              
              {someSelected && (
                <>
                  <button
                    onClick={handleClearSelection}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Clear Selection</span>
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    {selectedPosts.length} selected
                  </span>
                </>
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
      {/* Post List */}
      <PostList
        posts={currentPosts}
        selectedPosts={selectedPosts}
        onPostSelect={handlePostSelect}
        onPostPreview={setSelectedPostForPreview}
        onApprove={handleApprove}
        onReject={handleReject}
      />
 {/* Pagination & Posts Per Page (merged) */}
 {filteredPosts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mt-2 shadow-sm gap-3 sm:gap-0">
          {/* Left: Posts per page and range info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={postsPerPage}
                onChange={(e) => handlePostsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm transition-all duration-150"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">posts per page</span>
            </div>
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} posts
            </div>
          </div>
          {/* Right: Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and nearby pages
                const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-1 text-gray-400">...</span>
                    );
                  }
                  return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex items-center px-2 py-1 border text-sm font-medium rounded-md transition-all duration-150 ${
                      page === currentPage
                        ? 'bg-blue-100 border-blue-500 text-blue-700 font-semibold shadow'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-2 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

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