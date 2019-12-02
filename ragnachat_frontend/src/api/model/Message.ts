import {UserToken} from "./User";

export interface MessageCreate {
    cmd: "CREATE_MSG";
    channel: string;
    content: string;
}

export interface Last50Messages {
    cmd: "LAST_50_MSG";
}

export type MessageCMD = Last50Messages | MessageCreate;

export interface Message {
    id: string;
    channel: string;
    from: UserToken;
    content: string;
    date: number;
}
