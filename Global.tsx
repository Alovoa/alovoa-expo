import * as React from 'react-native';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as URL from "./URL";
import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { ConversationDto, UserDto } from "./types";
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import mime from "mime";
import FormData from "form-data";
import { Buffer } from "buffer";
import { cloneDeep } from 'lodash';

export const FLAG_FDROID = true;

export const navigationRef = createNavigationContainerRef()
export const INDEX_LOGIN = "0"
export const INDEX_REGISTER = "1"
export const INDEX_ONBOARDING = "2"
export const INDEX_MAIN = "3"

export const STORAGE_FIRSTNAME = "firstName";
export const STORAGE_PAGE = "page";
export const STORAGE_SCREEN = "screen";
export const STORAGE_YOUR_PROFILE = "your-profile"
export const STORAGE_YOUR_CHAT = "chat"
export const STORAGE_YOUR_CHAT_DETAIL = "chat/%s"
export const STORAGE_LIKES = "likes"
export const STORAGE_DONATE = "donate"
export const STORAGE_LATITUDE = "latitude"
export const STORAGE_LONGITUDE = "longitude"
export const STORAGE_RELOAD_SEARCH = "reloadSearch";
export const STORAGE_LOGIN_DATE = "loginDate";
export const STORAGE_SEARCH_LIKE_TOOLTIP = "search.like-tooltip";

export const STORAGE_SETTINGS_UNIT = "settings.unit"
export const STORAGE_SETTINGS_COLOR_PRIMARY = "settings.color.primary"
export const STORAGE_SETTINGS_COLOR_SECONDARY = "settings.color.secondary"

export const STORAGE_ADV_SEARCH_GPSTIMEOPUT = "adv-search.gps-timeout";

export const SCREEN_YOURPROFILE = "YourProfile"
export const SCREEN_CHAT = "Chat"
export const SCREEN_SEARCH = "Search"
export const SCREEN_LIKES = "Likes"
export const SCREEN_DONATE = "Donate"

export const SCREEN_PROFILE_PICTURES = "Profile.Pictures"
export const SCREEN_PROFILE_PROFILESETTINGS = "Profile.ProfileSettings"
export const SCREEN_PROFILE_SEARCHSETTINGS = "Profile.SearchSettings"
export const SCREEN_PROFILE_SEARCHPARAMETERS = "Profile.SearchParameters"
export const SCREEN_PROFILE_SETTINGS = "Profile.Settings"
export const SCREEN_PROFILE_ADVANCED_SETTINGS = "Profile.AdvancedSettings"

export const DEFAULT_COLOR_PRIMARY = '#EC407A';
export const DEFAULT_COLOR_SECONDARY = '#28C4ED';

export const EMPTY_STRING = "...";

export const MAX_INTERESTS = 10;
export const MAX_MESSAGE_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 255;
export const DEFAULT_GPS_TIMEOUT = 6000;

const IMG_SIZE_MAX = 600;

export async function Fetch(url: string = "", method: string = "get", data: any = undefined,
  contentType: string = "application/json"): Promise<AxiosResponse<any, any>> {
  try {
    let res = await axios({
      withCredentials: true,
      method: method,
      url: url,
      headers: {
        'Content-Type': contentType
      },
      data: data,
    });
    if (res.request.responseURL == URL.AUTH_LOGIN) {
      let page = await GetStorage(STORAGE_PAGE);
      if (page != INDEX_LOGIN) {
        SetStorage(STORAGE_PAGE, INDEX_LOGIN);
        navigate("Login");
        throw new Error("Not authenticated")
      }
    }
    return res;
  } catch (e) {
    console.log(e)
    throw e;
  }
}

export function nagivateProfile(user?: UserDto, uuid?: string) {
  navigate("Profile", false, {
    user: user,
    uuid: uuid
  });
}

export function nagivateChatDetails(conversation: ConversationDto) {
  navigate("MessageDetail", false, {
    conversation: conversation
  });
}

export function navigate(name: string, reset: boolean = false, params?: any) {
  if (navigationRef.isReady()) {
    if (!reset) {
      navigationRef.navigate(name, params);
    } else {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: name }],
        })
      );
    }
  }
}

export async function GetStorage(key: string): Promise<string | null> {
  if (React.Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function SetStorage(key: string, value: string) {
  if (React.Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function loadPage(page: string = INDEX_REGISTER) {
  if (INDEX_ONBOARDING == page) {
    navigate("Onboarding");
  } else if (INDEX_MAIN == page) {
    navigate("Main", true);
  } else if (INDEX_REGISTER == page) {
    navigate("Register");
  }
}

export function ShowToast(text: string) {
  if (React.Platform.OS === 'android') {
    React.ToastAndroid.show(text, React.ToastAndroid.LONG);
  } else {
    Toast.show({
      text1: text,
      visibilityTime: 3000,
      position: 'top'
    });
  }
}

export function isEmailValid(text: string) {
  let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(text);
}

export function isPasswordSecure(password: string): boolean {
  const minPasswordLength = 7;
  if (password.length < minPasswordLength) {
    return false;
  }
  return password.match(/[a-z]/i) != null && password.match(/[0-9]+/) != null;
}

export function calcAge(dob: Date | undefined): number {
  if (!dob) {
    return Number.MIN_VALUE;
  }
  let timeDiff = Math.abs(Date.now() - dob.getTime());
  let age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25);
  return age;
}

export async function pickImage(): Promise<string | null | undefined> {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
    base64: true,
    exif: true,
  });
  if (!result.canceled) {
    let format = ImageManipulator.SaveFormat.JPEG;
    const saveOptions: ImageManipulator.SaveOptions = { compress: 0.8, format: format, base64: true }
    const resizedImageData = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: IMG_SIZE_MAX, height: Platform.OS == 'android' ? IMG_SIZE_MAX : undefined } }],
      saveOptions
    );
    if (Platform.OS != 'web') {
      return Platform.select({ ios: resizedImageData.uri.replace('file://', ''), android: resizedImageData.uri })
    } else {
      return resizedImageData.base64;
    }
  } else {
    return null;
  }
};

export function buildFormData(imageData: string): FormData {

  const mimeType = mime.getType(imageData);
  var bodyFormData = new FormData();
  if (Platform.OS != "web") {
    bodyFormData.append('file', {
      name: imageData.split("/").pop(),
      type: mimeType,
      uri: imageData,
    });
  } else {
    const buffer = Buffer.from(imageData, "base64");
    const blob = new Blob([buffer]);
    bodyFormData.append('file', blob);
  }
  bodyFormData.append('mime', mimeType);
  return bodyFormData;
};

export function shuffleArray(array: Array<any>): Array<any> {
  const copy: Array<any> = cloneDeep(array);
  for (let i = copy.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const format = (str: string, ...args: any[]) => args.reduce((s, v) => s.replace('%s', v), str);