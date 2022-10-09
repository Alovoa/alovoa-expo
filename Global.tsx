import React from "react";
import { Platform, ToastAndroid } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as URL from "./URL";
import { createNavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-root-toast';

export const navigationRef = createNavigationContainerRef()
export const INDEX_REGISTER = "1"
export const INDEX_ONBOARDING = "2"
export const INDEX_MAIN = "3"

export async function Fetch(url: string = "", method: string = "get", data: any = {}, contentType: string = "application/json"): Promise<any> {
  console.log(url)
  try {
    let res = await axios({
      withCredentials: true,
      method: method,
      url: url,
      headers: {
        'Content-Type': contentType
      },
      data: data,
      
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

export function loadPage(page: string = INDEX_REGISTER) {
  console.log("loadpage: " + page)
  if (INDEX_ONBOARDING == page) {
    navigate("Onboarding");
  } else if (INDEX_MAIN == page) {
    navigate("Main");
  } else {
    navigate("Register");
  }
}

export function ShowToast(text: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(text, ToastAndroid.LONG);
  } else {
    Toast.show(text, {
      duration: Toast.durations.LONG,
      backgroundColor: "#424242"
    });
  }
  
}

export const format = (str: string, ...args: any[]) => args.reduce((s, v) => s.replace('%s', v), str);