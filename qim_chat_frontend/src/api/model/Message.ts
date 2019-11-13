import {UserToken} from "./User";

export interface MessageCreate {
    content: string
}

export interface Message {
    id: string;
    from: UserToken;
    content: string;
    date: number;
}
