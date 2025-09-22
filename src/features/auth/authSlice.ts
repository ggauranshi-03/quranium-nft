import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isToken: any;
}

const initialState: UserState = {
  isToken: false,
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    isLogeding: (state, action: PayloadAction<{ token: any }>) => {
      state.isToken = action.payload.token;
    },
  },
});

export const { isLogeding } = authSlice.actions;
export default authSlice.reducer;
