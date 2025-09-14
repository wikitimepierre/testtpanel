import { configureStore } from '@reduxjs/toolkit';
import boxReducer from './boxSlice';

export const store = configureStore({
  reducer: {
    boxes: boxReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;