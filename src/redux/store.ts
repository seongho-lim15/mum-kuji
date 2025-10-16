import {combineReducers} from "redux";
import {authSlice} from "@/redux/slices/authSlice";
import storage from 'redux-persist/lib/storage'; // 로컬 스토리지를 사용하도록 지정
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import {configureStore} from "@reduxjs/toolkit";

// 리듀서 등록
const rootReducer = combineReducers({
    auth: authSlice
})

// 영속성 설정
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth']
}

// 영속성이 적용된 리듀서 생성
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Redux 생성
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        })
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

