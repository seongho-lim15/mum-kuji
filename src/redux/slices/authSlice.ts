import {createSlice} from "@reduxjs/toolkit";

export interface AuthState {
    email: string | null;
    token: string | null;
}

const initialState: AuthState = {
    email: null,
    token: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) =>{
            const {email, token}  = action.payload;
            state.email = email;
            state.token = token
        },
        logout : (state) =>{
            state.email = "";
            state.token = "";
        }
    }
})