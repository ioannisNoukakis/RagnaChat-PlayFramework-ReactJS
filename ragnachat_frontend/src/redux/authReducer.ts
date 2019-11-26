import {Action} from "redux";

const SET_AUTH_STATUS = "QimChat/auth/SET_AUTH_STATUS";

interface SetAuthStatus extends Action<typeof SET_AUTH_STATUS> {
    id: String | null;
}

type AuthReducerAction =
    | SetAuthStatus;

export interface AuthReducerState {
    id: String | null;
}

export const AUTH_REDUCER_DEFAULT_STATE = {
    id: null,
};

export const reducer = (state: AuthReducerState = AUTH_REDUCER_DEFAULT_STATE, action: AuthReducerAction) => {
    switch (action.type) {
        case SET_AUTH_STATUS:
            return {...state, id: action.id};
        default:
            return state;
    }
};

export const setAuthStatus: (id: String | null) =>  SetAuthStatus = (id) => ({
    type: SET_AUTH_STATUS,
    id
});
