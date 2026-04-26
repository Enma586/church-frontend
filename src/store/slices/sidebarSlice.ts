import { createSlice } from '@reduxjs/toolkit';

interface SidebarState {
  /** Sidebar visible en móvil (overlay) */
  isOpen: boolean;
  /** Sidebar colapsado en escritorio (solo iconos) */
  isCollapsed: boolean;
}

function getInitialCollapsed(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sidebar-collapsed') === 'true';
}

const initialState: SidebarState = {
  isOpen: false,
  isCollapsed: getInitialCollapsed(),
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleMobile(state) {
      state.isOpen = !state.isOpen;
    },
    openMobile(state) {
      state.isOpen = true;
    },
    closeMobile(state) {
      state.isOpen = false;
    },
    toggleCollapse(state) {
      state.isCollapsed = !state.isCollapsed;
    },
    expand(state) {
      state.isCollapsed = false;
    },
    collapse(state) {
      state.isCollapsed = true;
    },
  },
});

export const {
  toggleMobile,
  openMobile,
  closeMobile,
  toggleCollapse,
  expand,
  collapse,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;