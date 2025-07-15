import { configureStore, createSlice } from '@reduxjs/toolkit';

// Sample data
const samplePosts = [
  {
    id: "post_1",
    title: "Amazing sunset photography tips",
    content: "Here are some great tips for capturing stunning sunset photos. First, always check the weather forecast...",
    author: {
      username: "photographer123",
      id: "user_1"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T10:30:00Z",
    status: "pending",
    reportCount: 3
  },
  {
    id: "post_2",
    title: "Best coffee shops in downtown",
    content: "I've been exploring the downtown area and found some incredible coffee shops that you must visit...",
    author: {
      username: "coffeelover",
      id: "user_2"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-13T09:15:00Z",
    status: "pending",
    reportCount: 5
  },
  {
    id: "post_3",
    title: "Quick workout routine for beginners",
    content: "Starting your fitness journey can be overwhelming, but this simple routine will help you get started...",
    author: {
      username: "fitnessguru",
      id: "user_3"
    },
    reportedReason: "Misinformation",
    reportedAt: "2025-07-13T08:45:00Z",
    status: "pending",
    reportCount: 2
  },
  {
    id: "post_4",
    title: "Travel guide to Europe",
    content: "Planning a trip to Europe? Here's everything you need to know about the best destinations...",
    author: {
      username: "traveler99",
      id: "user_4"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-12T16:20:00Z",
    status: "approved",
    reportCount: 1
  },
  {
    id: "post_5",
    title: "Controversial political opinion",
    content: "I think the current political situation is completely wrong and here's why...",
    author: {
      username: "politicaluser",
      id: "user_5"
    },
    reportedReason: "Hate Speech",
    reportedAt: "2025-07-12T14:10:00Z",
    status: "rejected",
    reportCount: 8
  }
];

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: samplePosts,
    selectedPosts: [],
    currentFilter: 'pending',
    loading: false,
    error: null,
    undoStack: []
  },
  reducers: {
    setFilter: (state, action) => {
      state.currentFilter = action.payload;
      state.selectedPosts = [];
    },
    selectPost: (state, action) => {
      const postId = action.payload;
      if (state.selectedPosts.includes(postId)) {
        state.selectedPosts = state.selectedPosts.filter(id => id !== postId);
      } else {
        state.selectedPosts.push(postId);
      }
    },
    selectAllPosts: (state) => {
      const filteredPosts = state.posts.filter(post => post.status === state.currentFilter);
      state.selectedPosts = filteredPosts.map(post => post.id);
    },
    clearSelection: (state) => {
      state.selectedPosts = [];
    },
    approvePost: (state, action) => {
      const postId = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        const previousStatus = post.status;
        post.status = 'approved';
        state.undoStack.push({
          type: 'approve',
          postId,
          previousStatus,
          timestamp: Date.now()
        });
      }
    },
    rejectPost: (state, action) => {
      const { postId, reason } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        const previousStatus = post.status;
        post.status = 'rejected';
        post.rejectionReason = reason;
        state.undoStack.push({
          type: 'reject',
          postId,
          previousStatus,
          timestamp: Date.now()
        });
      }
    },
    batchApprove: (state, action) => {
      const postIds = action.payload;
      postIds.forEach(postId => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          const previousStatus = post.status;
          post.status = 'approved';
          state.undoStack.push({
            type: 'approve',
            postId,
            previousStatus,
            timestamp: Date.now()
          });
        }
      });
      state.selectedPosts = [];
    },
    batchReject: (state, action) => {
      const { postIds, reason } = action.payload;
      postIds.forEach(postId => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          const previousStatus = post.status;
          post.status = 'rejected';
          post.rejectionReason = reason;
          state.undoStack.push({
            type: 'reject',
            postId,
            previousStatus,
            timestamp: Date.now()
          });
        }
      });
      state.selectedPosts = [];
    },
    undoAction: (state, action) => {
      const actionToUndo = action.payload;
      const post = state.posts.find(p => p.id === actionToUndo.postId);
      if (post) {
        post.status = actionToUndo.previousStatus;
        if (actionToUndo.type === 'reject') {
          delete post.rejectionReason;
        }
      }
      state.undoStack = state.undoStack.filter(a => a !== actionToUndo);
    }
  }
});

export const {
  setFilter,
  selectPost,
  selectAllPosts,
  clearSelection,
  approvePost,
  rejectPost,
  batchApprove,
  batchReject,
  undoAction
} = postsSlice.actions;

export const store = configureStore({
  reducer: {
    posts: postsSlice.reducer
  }
});

export default store;