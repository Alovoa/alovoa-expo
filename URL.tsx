import * as Global from "./Global";

//const DOMAIN : string = "http://localhost:8080"
//const DOMAIN : string = "https://beta.alovoa.com"
const DOMAIN : string = "https://alovoa.com"

export const AUTH_LOGIN = DOMAIN + "/login"
export const AUTH_GOOGLE = DOMAIN + "/oauth2/authorization/google"
export const AUTH_FACEBOOK = DOMAIN + "/oauth2/authorization/facebook"
export const AUTH_COOKIE = DOMAIN + "/oauth2/remember-me-cookie/%s"

export const USER_STATUS_ALERT = DOMAIN + "/user/status/new-alert"
export const USER_STATUS_MESSAGE = DOMAIN + "/user/status/new-message"

export const API_RESOURCE_DONATE = DOMAIN + "/api/v1/resource/donate"

export const format = (str : string, ...args: any[]) => args.reduce((s, v) => s.replace('%s', v), str);