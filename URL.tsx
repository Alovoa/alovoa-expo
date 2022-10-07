import * as Global from "./Global";

export const DOMAIN : string = "http://localhost:8080"
//const DOMAIN : string = "https://beta.alovoa.com"
//const DOMAIN : string = "https://alovoa.com"

export const IMPRINT = DOMAIN + "/imprint"
export const PRIVACY = DOMAIN + "/privacy"
export const TOS = DOMAIN + "/tos"

export const AUTH_LOGIN = DOMAIN + "/login"
export const AUTH_GOOGLE = DOMAIN + "/oauth2/authorization/google"
export const AUTH_FACEBOOK = DOMAIN + "/oauth2/authorization/facebook"
export const AUTH_COOKIE = DOMAIN + "/oauth2/remember-me-cookie/%s/%s"

export const API_RESOURCE_YOUR_PROFILE = DOMAIN + "/api/v1/resource/profile"
export const API_RESOURCE_PROFILE = DOMAIN + "/api/v1/resource/profile/view/%s"
export const API_RESOURCE_SEARCH = DOMAIN + "/api/v1/resource/search"
export const API_RESOURCE_ALERTS = DOMAIN + "/api/v1/resource/alerts"
export const API_RESOURCE_CHATS = DOMAIN + "/api/v1/resource/chats"
export const API_RESOURCE_CHAT_DETAIL = DOMAIN + "/api/v1/resource/chats/%s"
export const API_RESOURCE_DONATE = DOMAIN + "/api/v1/resource/donate"


export const REGISTER_OAUTH = DOMAIN + "/register-oauth";

export const USER_INTEREST_AUTOCOMPLETE = DOMAIN + "/user/interest/autocomplete/%s";
export const USER_ONBOARDING = DOMAIN + "/user/onboarding";
export const USER_STATUS_ALERT = DOMAIN + "/user/status/new-alert"
export const USER_STATUS_MESSAGE = DOMAIN + "/user/status/new-message"