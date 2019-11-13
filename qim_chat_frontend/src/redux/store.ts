import {combineReducers, createStore} from "redux";
import {AUTH_REDUCER_DEFAULT_STATE, AuthReducerState, reducer as auth} from "./authReducer";
import {MESSAGE_REDUCER_DEFAULT_STATE, MessageReducerState, reducer as message} from "./messageReducer";
import {useSelector as useReduxSelector, TypedUseSelectorHook,} from 'react-redux'

export interface StoreState {
    auth: AuthReducerState;
    message: MessageReducerState;
}

const STORE_INITIAL_STATE = {
    auth: AUTH_REDUCER_DEFAULT_STATE,
    message: MESSAGE_REDUCER_DEFAULT_STATE,
};

export const store = createStore(
    combineReducers<StoreState>({
        auth,
        message,
    }),
    STORE_INITIAL_STATE,
);

export const useSelector: TypedUseSelectorHook<StoreState> = useReduxSelector;
