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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;