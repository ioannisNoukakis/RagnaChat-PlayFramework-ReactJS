import {Action} from "redux";
import {Message} from "../api/model/Message";
import {MAX_MSG_IN_BROWSER_MEMORY} from "../constants";

const ADD_MESSAGE = "QimChat/message/ADD_MESSAGE";

interface AddMessage extends Action<typeof ADD_MESSAGE> {
    message: Message;
}

type MessageReducerAction =
    | AddMessage

export interface MessageReducerState {
    messages: Message[];
}

export const MESSAGE_REDUCER_DEFAULT_STATE = {
    messages: [],
};

export const reducer = (state: MessageReducerState = MESSAGE_REDUCER_DEFAULT_STATE, action: MessageReducerAction) => {
    switch (action.type) {
        case ADD_MESSAGE:
            return {...state, messages: [...[action.message], ...state.messages].slice(0, MAX_MSG_IN_BROWSER_MEMORY)};
        default:
            return state;
    }
};

export const addMessage: (message: Message) =>  AddMessage = (message) => ({
    type: ADD_MESSAGE,
    message,
});
