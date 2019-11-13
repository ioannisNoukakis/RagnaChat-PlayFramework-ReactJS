import {Action} from "redux";
import {Message} from "../api/model/Message";

const ADD_MESSAGE = "QimChat/message/ADD_MESSAGE";

interface AddMessage extends Action<typeof ADD_MESSAGE> {
    message: Message;
}

type MessageReducerAction =
    | AddMessage;

export interface MessageReducerState {
    messages: Message[];
}

export const MESSAGE_REDUCER_DEFAULT_STATE = {
    messages: [],
};

export const reducer = (state: MessageReducerState = MESSAGE_REDUCER_DEFAULT_STATE, action: MessageReducerAction) => {
    switch (action.type) {
        case ADD_MESSAGE:
            return {...state, messages: [...[action.message], ...state.messages]};
        default:
            return state;
    }
};
