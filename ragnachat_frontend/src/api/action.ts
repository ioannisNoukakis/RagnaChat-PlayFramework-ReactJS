import {AuthToken, UserAuth, UserCreate} from "./model/User";
import axios from "axios";
import {AUTH_CHECK_ENDPOINT, AUTH_ENDPOINT, USER_ENDPOINT} from "./urls";

const validateStatus = (status: number) => status >= 200 && status < 500;
const axiosConfig = {validateStatus, withCredentials: true};

export const createUser = async (user: UserCreate) => {
    const res = await axios.post<AuthToken>(USER_ENDPOINT, user, axiosConfig);
    return res.status === 200 ? res.data.id : null;
};

export const auth = async (user: UserAuth) => {
    const res = await axios.post<AuthToken>(AUTH_ENDPOINT, user, axiosConfig);
    return res.status === 200 ? res.data.id : null;
};

export const checkAuth = async () => {
    const res = await axios.get<AuthToken>(AUTH_CHECK_ENDPOINT, axiosConfig);
    return res.status === 200 ? res.data.id : null;
};
