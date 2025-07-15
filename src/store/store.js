import { configureStore } from '@reduxjs/toolkit';
import moderationReducer from './moderationSlice';

export const store = configureStore({
  reducer: {
    moderation: moderationReducer,
  },
});