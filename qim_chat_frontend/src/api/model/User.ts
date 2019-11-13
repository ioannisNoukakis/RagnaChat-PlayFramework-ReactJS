export interface UserAuth {
    username: string;
    password: string;
}

export interface UserToken {
    id: string;
    username: string;
    created: number;
}

export interface AuthToken {
    status: "ok"
    id: string; // user's id.
}

export type UserCreate = UserAuth;
