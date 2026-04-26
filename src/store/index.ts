import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import sidebarReducer from './slices/sidebarSlice';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';
import { createLocalStoragePersister } from './middleware/localStorage';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    sidebar: sidebarReducer,
    notifications: notificationReducer,
    auth: authReducer,
  },
});

// ─── Suscriptor de persistencia en localStorage ──────────────────────────────
// Escucha cambios en el store y guarda theme + sidebar en localStorage.
const persister = createLocalStoragePersister(() => store.getState());
store.subscribe(persister);

// ─── Tipos inferidos ─────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;