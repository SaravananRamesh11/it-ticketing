// AuthContext.js
import { createContext, useContext, useReducer } from 'react';
import React from 'react';

const AuthContext = createContext();

const initialState = {
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  id: localStorage.getItem('id') || null,
  isAuthenticated: !!localStorage.getItem('token'),
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('id', action.payload.id);
      return {
        ...state,
        token: action.payload.token,
        role: action.payload.role,
        id: action.payload.id,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('id');
      return {
        ...state,
        token: null,
        role: null,
        id: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
