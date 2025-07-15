import { createSlice } from '@reduxjs/toolkit';

const mockPosts = [{
  id: "post_123",
  title: "Sample Post Title",
  content: "Full post content here...",
  author: {
  username: "user123",
  id: "user_456"
  },
  reportedReason: "Spam",
  reportedAt: "2025-06-27T10:30:00Z",
  status: "pending",
  reportCount: 3
  },
  {
    id: "post_1",
    title: "Amazing sunset photos from my vacation",
    content: "Just got back from an incredible trip to Bali! The sunsets there are absolutely breathtaking. Here are some photos I took during my stay. Can't wait to go back!",
    author: {
      username: "traveler_john",
      id: "user_1"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T10:30:00Z",
    status: "pending",
    reportCount: 2
  },
  {
    id: "post_2",
    title: "Best coding practices for React developers",
    content: "After working with React for 3 years, I've compiled a list of best practices that every developer should follow. These tips will help you write cleaner, more maintainable code.",
    author: {
      username: "dev_sarah",
      id: "user_2"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-13T09:15:00Z",
    status: "pending",
    reportCount: 1
  },
  {
    id: "post_3",
    title: "Local restaurant recommendations",
    content: "Looking for great places to eat in downtown area. Any recommendations for good Italian restaurants?",
    author: {
      username: "foodie_mike",
      id: "user_3"
    },
    reportedReason: "Off-topic",
    reportedAt: "2025-07-13T08:45:00Z",
    status: "pending",
    reportCount: 3
  },
  {
    id: "post_4",
    title: "Weekly tech news roundup",
    content: "This week in tech: New AI developments, smartphone releases, and startup funding news. Stay updated with the latest trends.",
    author: {
      username: "tech_news",
      id: "user_4"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T07:20:00Z",
    status: "approved",
    reportCount: 1
  },
  {
    id: "post_5",
    title: "Fitness motivation tips",
    content: "Struggling to stay motivated with your fitness goals? Here are some proven strategies that have helped me stay consistent.",
    author: {
      username: "fitness_guru",
      id: "user_5"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-13T06:30:00Z",
    status: "rejected",
    reportCount: 4
  }
];

const moderationSlice = createSlice({
  name: 'moderation',
  initialState: {
    posts: mockPosts,
    selectedPosts: [],
    currentFilter: 'pending',
    recentActions: [],
    isLoading: false,
    error: null
  },
  reducers: {
    approvePost: (state, action) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.status = 'approved';
        state.recentActions.unshift({
          id: Date.now(),
          type: 'approve',
          postId: action.payload,
          timestamp: new Date().toISOString()
        });
      }
    },
    rejectPost: (state, action) => {
      const { postId, reason } = action.payload;
      const post = state.posts.find(p => p.id === postId);
      if (post) {
        post.status = 'rejected';
        post.rejectionReason = reason;
        state.recentActions.unshift({
          id: Date.now(),
          type: 'reject',
          postId: postId,
          timestamp: new Date().toISOString(),
          reason
        });
      }
    },
    batchApprove: (state, action) => {
      action.payload.forEach(postId => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.status = 'approved';
        }
      });
      state.recentActions.unshift({
        id: Date.now(),
        type: 'batchApprove',
        postIds: action.payload,
        timestamp: new Date().toISOString()
      });
      state.selectedPosts = [];
    },
    batchReject: (state, action) => {
      const { postIds, reason } = action.payload;
      postIds.forEach(postId => {
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.status = 'rejected';
          post.rejectionReason = reason;
        }
      });
      state.recentActions.unshift({
        id: Date.now(),
        type: 'batchReject',
        postIds: postIds,
        timestamp: new Date().toISOString(),
        reason
      });
      state.selectedPosts = [];
    },
    toggleSelectPost: (state, action) => {
      const postId = action.payload;
      const index = state.selectedPosts.indexOf(postId);
      if (index > -1) {
        state.selectedPosts.splice(index, 1);
      } else {
        state.selectedPosts.push(postId);
      }
    },
    selectAllPosts: (state) => {
      const pendingPosts = state.posts
        .filter(post => post.status === state.currentFilter)
        .map(post => post.id);
      state.selectedPosts = pendingPosts;
    },
    clearSelection: (state) => {
      state.selectedPosts = [];
    },
    setFilter: (state, action) => {
      state.currentFilter = action.payload;
      state.selectedPosts = [];
    },
    undoAction: (state, action) => {
      const actionToUndo = state.recentActions.find(a => a.id === action.payload);
      if (actionToUndo) {
        if (actionToUndo.type === 'approve') {
          const post = state.posts.find(p => p.id === actionToUndo.postId);
          if (post) post.status = 'pending';
        } else if (actionToUndo.type === 'reject') {
          const post = state.posts.find(p => p.id === actionToUndo.postId);
          if (post) {
            post.status = 'pending';
            delete post.rejectionReason;
          }
        } else if (actionToUndo.type === 'batchApprove') {
          actionToUndo.postIds.forEach(postId => {
            const post = state.posts.find(p => p.id === postId);
            if (post) post.status = 'pending';
          });
        } else if (actionToUndo.type === 'batchReject') {
          actionToUndo.postIds.forEach(postId => {
            const post = state.posts.find(p => p.id === postId);
            if (post) {
              post.status = 'pending';
              delete post.rejectionReason;
            }
          });
        }
        state.recentActions = state.recentActions.filter(a => a.id !== action.payload);
      }
    }
  }
});

export const {
  approvePost,
  rejectPost,
  batchApprove,
  batchReject,
  toggleSelectPost,
  selectAllPosts,
  clearSelection,
  setFilter,
  undoAction
} = moderationSlice.actions;

export default moderationSlice.reducer;
