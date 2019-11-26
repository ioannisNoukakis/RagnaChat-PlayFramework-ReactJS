import {UserToken} from "./User";

export interface MessageCreate {
    channel: string;
    content: string;
}

export interface Message {
    id: string;
    channel: string;
    from: UserToken;
    content: string;
    date: number;
}
