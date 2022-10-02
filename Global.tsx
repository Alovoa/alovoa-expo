import React from "react";
import { Platform } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as URL from "./URL";
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef()
export const INDEX_REGISTER = "1"
export const INDEX_ONBOARDING = "2"
export const INDEX_MAIN = "3"

export async function Fetch(url: string = "", method: string = "get", data: any = {}): Promise<any> {
  console.log(url)
  try {
    let res = await axios({
      withCredentials: true,
      method: method,
      url: url,
      data: data
    })
    if (res.request.responseURL == URL.AUTH_LOGIN) {
      navigate("Login")
      throw new Error("Not authenticated")
    }
    return res;
  } catch (e) {
    console.log(e);
    throw e;
  }
  

  /*
  let res = await fetch(url, {
    method: method,
    credentials: "same-origin"
  });
  console.log(JSON.stringify(res))
  return res;
  */
}

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export async function GetStorage(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function SetStorage(key: string, value: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function loadPage(page : string = INDEX_REGISTER) {
  console.log("loadpage: " + page)
  if(INDEX_ONBOARDING == page) {
      navigate("Onboarding");
  } else if (INDEX_MAIN == page) {
      navigate("Main");
  } else {
    navigate("Register");
  }
}