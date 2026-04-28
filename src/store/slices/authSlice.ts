import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, {getErrorMessage} from '@/lib/axios';
import type { User, LoginPayload, ApiResponse } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post<ApiResponse<User>>('/users/login', credentials);
      if (!data.success || !data.data) {
        return rejectWithValue(data.message || 'Error al iniciar sesión');
      }
      return data.data;
        } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, 'Error de conexión al iniciar sesión'));
    }
  },
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/users/logout');
       } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, 'Error de conexión al iniciar sesión'));
    }
  },
);

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<ApiResponse<User>>('/users/me');
      if (!data.success || !data.data) {
        return rejectWithValue(data.message || 'Sesión no válida');
      }
      return data.data;
    } catch (err: unknown) {
      return rejectWithValue(getErrorMessage(err, 'Error de conexión al iniciar sesión'));
    }
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ─────────────────────────────────────────────────────────────
    builder.addCase(loginUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Error desconocido';
      state.isAuthenticated = false;
      state.user = null;
    });

    // ── Logout ────────────────────────────────────────────────────────────
    builder.addCase(logoutUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.status = 'idle';
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      // Incluso si falla la llamada HTTP, limpiamos el estado local
      state.status = 'idle';
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // ── Fetch current user ────────────────────────────────────────────────
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload ?? 'Sesión expirada';
      state.isAuthenticated = false;
      state.user = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;