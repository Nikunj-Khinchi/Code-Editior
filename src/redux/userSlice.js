import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: "",
  displayName: "",
  email: "",
  phoneNumber: "",
  photoURL: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.uid = action.payload.uid;
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;
      state.photoURL = action.payload.photoURL;
    },
    logout: () => initialState,
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
