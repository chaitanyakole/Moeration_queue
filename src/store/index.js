import { configureStore, createSlice } from '@reduxjs/toolkit';
const samplePosts = [
  {
    id: "post_1",
    title: "Amazing sunset photography tips",
    content: "Here are some great tips for capturing stunning sunset photos. First, always check the weather forecast...",
    images: ["/assets/image-1.jpg", "https://picsum.photos/800/600?random=2"],
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
    images: ["/assets/coffieImage.jpg"],
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
    images: ["/assets/workoutImage.jpg", "https://picsum.photos/800/600?random=5"],
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
    images: ["/assets/europeTravel.jpg"],
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
    images: [],
    author: {
      username: "politicaluser",
      id: "user_5"
    },
    reportedReason: "Hate Speech",
    reportedAt: "2025-07-12T14:10:00Z",
    status: "rejected",
    reportCount: 8
  },
  {
    id: "post_6",
    title: "Delicious homemade pizza recipe",
    content: "Who doesn't love pizza? Here's my grandmother's secret recipe that's been passed down for generations...",
    images: ["/assets/pizzaImage.jpg"],
    author: {
      username: "foodie_chef",
      id: "user_6"
    },
    reportedReason: "Copyright Violation",
    reportedAt: "2025-07-13T11:45:00Z",
    status: "pending",
    reportCount: 1
  },
  {
    id: "post_7",
    title: "My weekend hiking adventure",
    content: "Just got back from an amazing hike in the mountains. The views were absolutely breathtaking...",
    images: ["https://picsum.photos/800/600?random=10"],
    author: {
      username: "nature_lover",
      id: "user_7"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T07:20:00Z",
    status: "approved",
    reportCount: 2
  },
  {
    id: "post_8",
    title: "Tech review: Latest smartphone",
    content: "I've been testing the latest flagship smartphone for two weeks now, and here are my thoughts...",
    images: ["https://picsum.photos/800/600?random=11", "https://picsum.photos/800/600?random=12"],
    author: {
      username: "tech_reviewer",
      id: "user_8"
    },
    reportedReason: "Misinformation",
    reportedAt: "2025-07-13T12:30:00Z",
    status: "pending",
    reportCount: 4
  },
  {
    id: "post_9",
    title: "DIY home renovation tips",
    content: "Renovating your home doesn't have to break the bank. Here are some budget-friendly tips...",
    images: ["https://picsum.photos/800/600?random=13"],
    author: {
      username: "diy_master",
      id: "user_9"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-12T18:15:00Z",
    status: "rejected",
    reportCount: 3
  },
  {
    id: "post_10",
    title: "Book recommendations for summer",
    content: "Summer is here and it's time to relax with a good book. Here are my top 10 recommendations...",
    images: ["https://picsum.photos/800/600?random=14", "https://picsum.photos/800/600?random=15"],
    author: {
      username: "bookworm_reader",
      id: "user_10"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T15:00:00Z",
    status: "pending",
    reportCount: 1
  },
  {
    id: "post_11",
    title: "Gardening tips for beginners",
    content: "Starting a garden can seem daunting, but with these simple tips, you'll have a thriving garden in no time...",
    images: ["https://picsum.photos/800/600?random=16"],
    author: {
      username: "green_thumb",
      id: "user_11"
    },
    reportedReason: "Misinformation",
    reportedAt: "2025-07-13T13:45:00Z",
    status: "approved",
    reportCount: 2
  },
  {
    id: "post_12",
    title: "Fashion trends this season",
    content: "Fashion is constantly evolving, and this season brings some exciting new trends...",
    images: ["https://picsum.photos/800/600?random=17", "https://picsum.photos/800/600?random=18", "https://picsum.photos/800/600?random=19"],
    author: {
      username: "fashion_guru",
      id: "user_12"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-13T14:20:00Z",
    status: "pending",
    reportCount: 6
  },
  {
    id: "post_13",
    title: "Cryptocurrency investment guide",
    content: "Investing in cryptocurrency can be risky, but here's what you need to know before getting started...",
    images: [],
    author: {
      username: "crypto_trader",
      id: "user_13"
    },
    reportedReason: "Scam",
    reportedAt: "2025-07-12T20:30:00Z",
    status: "rejected",
    reportCount: 12
  },
  {
    id: "post_14",
    title: "Pet care essentials",
    content: "Taking care of your furry friend requires knowledge and preparation. Here are the essentials...",
    images: ["https://picsum.photos/800/600?random=20", "https://picsum.photos/800/600?random=21"],
    author: {
      username: "pet_lover",
      id: "user_14"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T16:10:00Z",
    status: "pending",
    reportCount: 1
  },
  {
    id: "post_15",
    title: "Meditation and mindfulness practice",
    content: "In our busy world, finding inner peace is more important than ever. Here's how to start...",
    images: ["https://picsum.photos/800/600?random=22"],
    author: {
      username: "mindful_soul",
      id: "user_15"
    },
    reportedReason: "Misinformation",
    reportedAt: "2025-07-13T17:25:00Z",
    status: "approved",
    reportCount: 1
  },
  {
    id: "post_16",
    title: "Car maintenance checklist",
    content: "Regular car maintenance can save you money and keep you safe on the road...",
    images: ["https://picsum.photos/800/600?random=23", "https://picsum.photos/800/600?random=24"],
    author: {
      username: "car_mechanic",
      id: "user_16"
    },
    reportedReason: "Inappropriate Content",
    reportedAt: "2025-07-13T18:40:00Z",
    status: "pending",
    reportCount: 2
  },
  {
    id: "post_17",
    title: "Learning a new language",
    content: "Mastering a new language opens up a world of opportunities. Here's how to get started...",
    images: ["https://picsum.photos/800/600?random=25"],
    author: {
      username: "polyglot_teacher",
      id: "user_17"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-12T22:15:00Z",
    status: "approved",
    reportCount: 1
  },
  {
    id: "post_18",
    title: "Board game night recommendations",
    content: "Looking for fun games to play with friends and family? Here are my top picks...",
    images: ["https://picsum.photos/800/600?random=26", "https://picsum.photos/800/600?random=27", "https://picsum.photos/800/600?random=28"],
    author: {
      username: "board_game_fan",
      id: "user_18"
    },
    reportedReason: "Copyright Violation",
    reportedAt: "2025-07-13T19:50:00Z",
    status: "pending",
    reportCount: 3
  },
  {
    id: "post_19",
    title: "Healthy meal prep ideas",
    content: "Meal prepping can help you eat healthier and save time. Here are some delicious ideas...",
    images: ["https://picsum.photos/800/600?random=29"],
    author: {
      username: "healthy_chef",
      id: "user_19"
    },
    reportedReason: "Misinformation",
    reportedAt: "2025-07-13T21:05:00Z",
    status: "rejected",
    reportCount: 4
  },
  {
    id: "post_20",
    title: "Music production basics",
    content: "Want to create your own music? Here's everything you need to know to get started...",
    images: ["https://picsum.photos/800/600?random=30", "https://picsum.photos/800/600?random=31"],
    author: {
      username: "music_producer",
      id: "user_20"
    },
    reportedReason: "Spam",
    reportedAt: "2025-07-13T22:30:00Z",
    status: "pending",
    reportCount: 2
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