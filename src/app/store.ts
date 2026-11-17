import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { api } from './api';
export const store = configureStore({ reducer:{auth:authReducer,[api.reducerPath]:api.reducer,[authApi.reducerPath]:authApi.reducer}, middleware:getDefault=>getDefault().concat(api.middleware,authApi.middleware) });
export type RootState=ReturnType<typeof store.getState>; export type AppDispatch=typeof store.dispatch;
