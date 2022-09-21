import React from "react";
import { Platform } from 'react-native';
import axios, { AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as URL from "./URL";

export async function Fetch(url : string = '', method : string = 'get', data : any = {}) : Promise<any> {
  
  
  console.log(url)
  try {
    let res = await axios({
      withCredentials: true,
      method: method,
      url: url,
      data: data
    })
    if(res.request.responseURL == URL.AUTH_LOGIN) {
        console.log("not authenticated!")
        return null;
    } else {
      //console.log(res)
    }
    return res;
  } catch (e) {
    console.log("err");
    console.log(e);
  }
  return null;

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