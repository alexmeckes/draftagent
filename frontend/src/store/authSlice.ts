import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../services/api';

interface User {
  id: string;
  sleeper_user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  preferences?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const connectSleeper = createAsyncThunk(
  'auth/connectSleeper',
  async (username: string) => {
    const response = await authApi.connectSleeper(username);
    localStorage.setItem('userId', response.user.id);
    return response.user;
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async () => {
    const response = await authApi.getSession();
    return response.user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApi.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Connect Sleeper
      .addCase(connectSleeper.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectSleeper.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(connectSleeper.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to connect to Sleeper';
      })
      // Check Session
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(checkSession.rejected, (state) => {
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;