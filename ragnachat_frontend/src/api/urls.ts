import {BASE_HOST} from "../config";

const HTTP_BASE_HOST = "http://" + BASE_HOST;
export const USER_ENDPOINT = HTTP_BASE_HOST + "/user";
export const AUTH_ENDPOINT = HTTP_BASE_HOST + "/auth";
export const AUTH_CHECK_ENDPOINT = HTTP_BASE_HOST + "/check";
export const WS_ENDPOINT = "ws://" + BASE_HOST + "/ws";
