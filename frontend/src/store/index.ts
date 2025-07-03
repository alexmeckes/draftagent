import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import draftReducer from './draftSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    draft: draftReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['draft.players', 'draft.picks', 'draft.analysis'],
        // Ignore these action types
        ignoredActionPaths: ['payload.players', 'payload.picks'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export everything to ensure it's available
export { store as default };