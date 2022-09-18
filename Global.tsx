import React from "react";
import { Platform } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function Fetch(url : string = '', method : string = 'get', data : any = {}) : Promise<AxiosResponse<any, any>> {
  let cookie = await GetStorage("remember-me");
  let headers = { Cookie: "remember-me=" + cookie };

  return await axios({
    method: method,
    url: url,
    data: data,
    headers: headers
  })

}

export async function GetStorage(key : string) : Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function SetStorage(key : string, value : string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}