import { configureStore, ThunkAction, Action, getDefaultMiddleware } from '@reduxjs/toolkit';
import connectionReducer from './connection';
import uiReducer from './ui';

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    ui: uiReducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
