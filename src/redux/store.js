import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './UserSlice';
import { orderSlice } from './OrderSlice';
import themeReducer from './ThemeSlice';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    order: orderSlice.reducer,
    theme: themeReducer,
  },
});
