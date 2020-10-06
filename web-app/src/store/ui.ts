import { createSlice } from "@reduxjs/toolkit";

const TOAST_LIFESPAN = 5000;

type Toast = {
  id: number;
  text: string;
};

type SliceState = {
  toasts: Toast[];
};

const initialState: SliceState = {
  toasts: [],
};

const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    addToast: (state, action) =>
      void (state.toasts = [
        ...state.toasts,
        { text: action.payload.text, id: action.payload.id },
      ]),
    removeToast: (state, action) =>
      void (state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      )),
  },
});

export const { addToast, removeToast } = slice.actions;

export const toast = (text: string) => (dispatch: any) => {
  const id = Date.now();
  dispatch(addToast({ text, id }));
  setTimeout(() => dispatch(removeToast(id)), TOAST_LIFESPAN);
};

export default slice.reducer;
