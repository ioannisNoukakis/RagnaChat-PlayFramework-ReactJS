import {Action} from "redux";
import {Message} from "../api/model/Message";
import {MAX_MSG_IN_BROWSER_MEMORY} from "../constants";

const ADD_MESSAGE = "QimChat/message/ADD_MESSAGE";
const SET_CHANNEL = "QimChat/message/SET_CHANNEL";

interface AddMessage extends Action<typeof ADD_MESSAGE> {
    message: Message;
}

interface SetChannel extends Action<typeof SET_CHANNEL> {
    channel: string;
}

type MessageReducerAction =
    | AddMessage
    | SetChannel;

export interface MessageReducerState {
    messages: Message[];
    channel: string | null;
}

export const MESSAGE_REDUCER_DEFAULT_STATE = {
    messages: [],
    channel: null,
};

export const reducer = (state: MessageReducerState = MESSAGE_REDUCER_DEFAULT_STATE, action: MessageReducerAction) => {
    switch (action.type) {
        case ADD_MESSAGE:
            return {...state, messages: [...[action.message], ...state.messages].slice(0, MAX_MSG_IN_BROWSER_MEMORY)};
        case SET_CHANNEL:
            return {...state, channel: action.channel};
        default:
            return state;
    }
};

export const addMessage: (message: Message) =>  AddMessage = (message) => ({
    type: ADD_MESSAGE,
    message,
});

export const setChannel: (channel: string) => SetChannel = (channel) => ({
    type: SET_CHANNEL,
    channel,
});
