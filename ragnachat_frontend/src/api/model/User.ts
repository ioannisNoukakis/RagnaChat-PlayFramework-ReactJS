export interface UserToken {
    id: string;
    name: string;
    created: number;
    pictureUrl?: string;
}

export interface UserGooleAuth {
    idTokenString: string
}

export interface AuthToken {
    status: "ok"
    id: string; // user's id.
}
