import Constants from "expo-constants";
import { StyleSheet, I18nManager } from "react-native";

export const WHITE = "#FFFFFF";
export const GRAY = "#757E90";
export const DARK_GRAY = "#363636";
export const BLACK = "#000000";
export const LINK = "#ec407a";

export const ONLINE_STATUS = "#46A575";
export const OFFLINE_STATUS = "#D04949";

export const LIKE_ACTIONS = WHITE;
export const DISLIKE_ACTIONS = WHITE;

export const STATUS_BAR_HEIGHT: number = Constants.statusBarHeight;
export const NAVIGATION_BAR_HEIGHT = 80;
export const WIDESCREEN_HORIZONTAL_MAX = 600;

export default StyleSheet.create({
  textInputAlign: {
    textAlign: I18nManager.isRTL ? "right" : "left",
  },
  link: {
    color: LINK,
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  radioButton: {
    marginBottom: 12,
    marginTop: 12,
  },
  switchText: {
    marginBottom: 12,
    marginTop: 12,
  },
  marginRight4: {
    marginRight: 4
  },
  marginRight8: {
    marginRight: 8
  },
  marginBottom4: {
    marginBottom: 4
  },
  marginBottom8: {
    marginBottom: 18
  },
  marginBottom12: {
    marginBottom: 12
  },
  padding12: {
    padding: 12
  },
  // COMPONENT - CARD ITEM
  containerCardItem: {
    borderRadius: 8,
    alignItems: "center",
    margin: 4,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowColor: GRAY,
    shadowOffset: { height: 0, width: 0 },
    flexGrow: 1,
    // width: width - 8
  },
  matchesTextCardItem: {
    color: WHITE,
  },
  descriptionCardItem: {
    textAlign: I18nManager.isRTL ? "right" : "left",
    flexShrink: 1,
    opacity: 0.8,
  },
  status: {
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: GRAY,
    fontSize: 12,
  },
  online: {
    width: 6,
    height: 6,
    backgroundColor: ONLINE_STATUS,
    borderRadius: 3,
    marginRight: 4,
  },
  offline: {
    width: 6,
    height: 6,
    backgroundColor: OFFLINE_STATUS,
    borderRadius: 3,
    marginRight: 4,
  },
  actionsCardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingTop: 12
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowColor: DARK_GRAY,
    shadowOffset: { height: 10, width: 0 },
  },
  miniButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: WHITE,
    marginHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowColor: DARK_GRAY,
    shadowOffset: { height: 10, width: 0 },
  },

  // COMPONENT - CITY
  city: {
    backgroundColor: WHITE,
    padding: 10,
    borderRadius: 20,
    width: 100,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowColor: BLACK,
    shadowOffset: { height: 0, width: 0 },
  },
  cityText: {
    color: DARK_GRAY,
    fontSize: 13,
    textAlign: "center",
  },

  // COMPONENT - FILTERS
  filters: {
    backgroundColor: WHITE,
    padding: 4,
    borderRadius: 20,
    width: 90,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowColor: BLACK,
    shadowOffset: { height: 0, width: 0 }

  },
  filtersText: {
    color: DARK_GRAY,
    fontSize: 13,
    textAlign: "center",
  },

  // COMPONENT - MESSAGE
  containerMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    paddingHorizontal: 10,
    // width: width - 100,
  },
  avatar: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginRight: 20,
    marginVertical: 15,
  },
  message: {
    color: GRAY,
    fontSize: 12,
    paddingTop: 5,
  },

  // COMPONENT - PROFILE ITEM
  containerProfileItem: {
    paddingHorizontal: 10,
    paddingBottom: 25,
    margin: 20,
  },
  matchesTextProfileItem: {
    color: WHITE,
    textAlign: "center",
  },
  name: {
    paddingTop: 25,
    paddingBottom: 5,
    fontSize: 24,
    textAlign: "center",
  },
  descriptionProfileItem: {
    color: GRAY,
    textAlign: "center",
    paddingBottom: 20,
    fontSize: 13,
  },
  info: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  iconProfile: {
    fontSize: 12,
    color: DARK_GRAY,
    paddingHorizontal: 10,
  },
  infoContent: {
    color: GRAY,
    fontSize: 13,
  },

  // CONTAINER - GENERAL
  bg: {
    flex: 1,
    resizeMode: "cover",
    // width: width,
    // height: height,
  },
  top: {
    paddingTop: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { paddingBottom: 10, fontSize: 22 },

  // CONTAINER - HOME
  containerHome: {
    marginHorizontal: 10,
  },

  // CONTAINER - MATCHES
  containerMatches: {
    justifyContent: "space-around",
    flex: 1,
  },

  // CONTAINER - MESSAGES
  containerMessages: {
    justifyContent: "space-between",
    flex: 1,
    paddingHorizontal: 10,
  },

  // CONTAINER - PROFILE
  containerProfile: { marginHorizontal: 0 },
  topIconLeft: {
    paddingLeft: 20,
  },
  topIconRight: {
    paddingRight: 20,
  },
  actionsProfile: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  textButton: {
    fontSize: 15,
    color: WHITE,
    paddingLeft: 5,
  },

  // MENU
  tabButtonText: {
    textTransform: "uppercase",
  },
  iconMenu: {
    alignItems: "center",
  },
});
