import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/auth";
interface AuthState { user: User | null; accessToken: string | null; isAuthenticated: boolean; }
const storedToken = localStorage.getItem("accessToken");
const storedUser = localStorage.getItem("user");
const initialState: AuthState = { user: storedUser ? JSON.parse(storedUser) : null, accessToken: storedToken, isAuthenticated: Boolean(storedToken && storedUser) };
const authSlice = createSlice({ name: "auth", initialState, reducers: {
  loginSuccess: (state, action: PayloadAction<{accessToken:string; user:User}>) => { state.accessToken=action.payload.accessToken; state.user=action.payload.user; state.isAuthenticated=true; localStorage.setItem("accessToken",action.payload.accessToken); localStorage.setItem("user",JSON.stringify(action.payload.user)); },
  logout: state => { state.user=null; state.accessToken=null; state.isAuthenticated=false; localStorage.removeItem("accessToken"); localStorage.removeItem("user"); }
}});
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
