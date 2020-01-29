import {AuthToken, UserGooleAuth} from "./model/User";
import axios from "axios";
import {AUTH_CHECK_ENDPOINT, AUTH_ENDPOINT} from "./urls";

const validateStatus = (status: number) => status >= 200 && status < 500;
const axiosConfig = {validateStatus, withCredentials: true};

export const auth = async (auth: UserGooleAuth) => {
    const res = await axios.post<AuthToken>(AUTH_ENDPOINT, auth, axiosConfig);
    return res.status === 200 ? res.data.id : null;
};

export const checkAuth = async () => {
    const res = await axios.get<AuthToken>(AUTH_CHECK_ENDPOINT, axiosConfig);
    return res.status === 200 ? res.data.id : null;
};
