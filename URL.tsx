export const DOMAIN : string = "http://localhost:8080"
//export const DOMAIN : string = "https://beta.alovoa.com"
//export const DOMAIN : string = "https://alovoa.com"

export const PATH_BOOLEAN_TRUE = "true"
export const PATH_BOOLEAN_FALSE = "false"

export const IMPRINT = DOMAIN + "/imprint"
export const PRIVACY = DOMAIN + "/privacy"
export const TOS = DOMAIN + "/tos"
export const DONATE_LIST = DOMAIN + "/donate-list"

export const AUTH_LOGIN = DOMAIN + "/login"
export const AUTH_LOGOUT = DOMAIN + "/logout"
export const AUTH_LOGIN_ERROR = DOMAIN + "/?auth-error"

export const AUTH_GOOGLE = DOMAIN + "/oauth2/authorization/google"
export const AUTH_FACEBOOK = DOMAIN + "/oauth2/authorization/facebook"
export const AUTH_COOKIE = DOMAIN + "/oauth2/remember-me-cookie/%s/%s"

export const API_RESOURCE_YOUR_PROFILE = DOMAIN + "/api/v1/resource/profile"
export const API_RESOURCE_PROFILE = DOMAIN + "/api/v1/resource/profile/view/%s"
export const API_RESOURCE_SEARCH = DOMAIN + "/api/v1/resource/search"
export const API_RESOURCE_ALERTS = DOMAIN + "/api/v1/resource/alerts"
export const API_RESOURCE_CHATS = DOMAIN + "/api/v1/resource/chats"
export const API_RESOURCE_CHATS_DETAIL = DOMAIN + "/api/v1/resource/chats/%s"
export const API_RESOURCE_DONATE = DOMAIN + "/api/v1/resource/donate"
export const API_RESOURCE_USER_ONBOARDING = DOMAIN + "/api/v1/resource/user/onboarding"
export const API_RESOURCE_USER_BLOCKED = DOMAIN + "/api/v1/resource/blocked-users"
export const API_RESOURCE_USER_LIKED = DOMAIN + "/api/v1/resource/liked-users"
export const API_RESOURCE_USER_HIDDEN = DOMAIN + "/api/v1/resource/disliked-users"

//lat: number, lon: number, distance: number, sort: number
export const API_SEARCH_USERS = DOMAIN + "/api/v1/search/users/%s/%s/%s/%s"
export const API_SEARCH_USERS_DEFAULT = DOMAIN + "/api/v1/search/users/default"
export const API_DONATE_RECENT = DOMAIN + "/api/v1/donate/recent/%s";
export const API_MESSAGE_UPDATE = DOMAIN + "/api/v1/message/update/%s/%s";

export const CATPCHA_GENERATE = DOMAIN + "/captcha/generate";

export const PASSWORD_RESET = DOMAIN + "/password/reset"

export const REGISTER = DOMAIN + "/register";
export const REGISTER_OAUTH = DOMAIN + "/register-oauth";

export const USER_INTEREST_AUTOCOMPLETE = DOMAIN + "/user/interest/autocomplete/%s";
export const USER_ONBOARDING = DOMAIN + "/user/onboarding";
export const USER_STATUS_ALERT = DOMAIN + "/user/status/new-alert"
export const USER_STATUS_ALERT_LANG = DOMAIN + "/user/status/new-alert/%s"
export const USER_STATUS_MESSAGE = DOMAIN + "/user/status/new-message"

export const USER_UPDATE_PROFILE_PICTURE = DOMAIN + "/user/update/profile-picture"
export const USER_UPDATE_DESCRIPTION = DOMAIN + "/user/update/description"
export const USER_UPDATE_INTENTION = DOMAIN + "/user/update/intention/%s"
export const USER_UPDATE_MIN_AGE = DOMAIN + "/user/update/min-age/%s"
export const USER_UPDATE_MAX_AGE = DOMAIN + "/user/update/max-age/%s"
export const USER_UPDATE_PREFERED_GENDER = DOMAIN + "/user/update/preferedGender/%s/%s"
export const USER_UPDATE_MISC_INFO = DOMAIN + "/user/update/misc-info/%s/%s"
export const USER_ADD_INTEREST = DOMAIN + "/user/interest/add/%s"
export const USER_REMOVE_INTEREST = DOMAIN + "/user/interest/delete/%s"
export const USER_UPDATE_UNITS = DOMAIN + "/user/units/update/%s"
export const USER_USERDATA = DOMAIN + "/user/userdata/%s";
export const USER_DELETE_ACCOUNT = DOMAIN + "/user/delete-account";

export const USER_LIKE = DOMAIN + "/user/like/%s"
export const USER_LIKE_MESSAGE = DOMAIN + "/user/like/%s/%s"
export const USER_HIDE = DOMAIN + "/user/hide/%s"
export const USER_BLOCK = DOMAIN + "/user/block/%s"
export const USER_UNBLOCK = DOMAIN + "/user/unblock/%s"
export const USER_REPORT = DOMAIN + "/user/report/%s"
export const USER_ADD_IMAGE = DOMAIN + "/user/image/add"
export const USER_DELETE_IMAGE = DOMAIN + "/user/image/delete/%s"

export const USER_PROMPT_DELETE = DOMAIN + "/user/prompt/delete/%s"
export const USER_PROMPT_ADD = DOMAIN + "/user/prompt/add"
export const USER_PROMPT_UPDATE = DOMAIN + "/user/prompt/update"

export const USER_SETTING_EMAIL_LIKE = DOMAIN + "/user/settings/emailLike/update/%s"
export const USER_SETTING_EMAIL_CHAT = DOMAIN + "/user/settings/emailChat/update/%s"

export const USER_UPDATE_VERIFICATION_PICTURE = DOMAIN + "/user/update/verification-picture"
export const USER_UPDATE_VERIFICATION_PICTURE_UPVOTE = DOMAIN + "/user/update/verification-picture/upvote/%s"
export const USER_UPDATE_VERIFICATION_PICTURE_DOWNVOTE = DOMAIN + "/user/update/verification-picture/downvote/%s"

export const MESSAGE_SEND = DOMAIN + "/message/send/%s";