import React, { useState } from "react";
import { View, RefreshControl, ScrollView, Alert, Dimensions, useWindowDimensions } from "react-native";
import CardStack, { Card } from "react-native-card-stack-swiper";
import { CardItem } from "../components";
import { UserDto, SearchResource, SearchDto, UnitsEnum } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as Location from 'expo-location';
import { ActivityIndicator } from "react-native-paper";


const i18n = I18N.getI18n()

enum SORT {
  DISTANCE = 1,
  ACTIVE_DATE = 2,
  INTEREST = 3,
  DONATION_LATEST = 4,
  DONATION_TOTAL = 5,
  NEWEST_USER = 6
}

const Search = ({ route, navigation }) => {

  let swiper: any = React.useRef(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = useState(Array<UserDto>);
  const [sort, setSort] = useState(SORT.DONATION_LATEST);
  const [distance, setDistance] = React.useState(50);
  const [stackKey, setStackKey] = React.useState(0);
  const [firstSearch, setFirstSearch] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  
  let latitude: number | undefined;
  let longitude: number | undefined;

  const { height, width } = useWindowDimensions();

  const LOCATION_TIMEOUT_SHORT = 2000;
  const LOCATION_TIMEOUT_LONG = 5000;

  const promiseWithTimeout = (timeoutMs: number, promise: Promise<any>) => {
    return Promise.race([
      promise,
      new Promise((resolve, reject) => setTimeout(() => reject(), timeoutMs)),
    ]);
  }

  React.useEffect(() => {
    setStackKey(new Date().getTime());
    for (let i = 0; i < results.length; i++) {
      swiper.current?.goBackFromTop();
    }
  }, [results]);

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    if (route.params?.changed) {
      swiper.current?.swipeTop();
      let resultsCopy = [...results];
      resultsCopy.shift();
      setResults(resultsCopy);
      route.params.changed = false;
      if(resultsCopy.length == 0) {
        load();
      }
    }
  }, [route.params?.changed]);

  async function load() {
    let l1 = await Global.GetStorage(Global.STORAGE_LATITUDE);
    latitude = l1 ? Number(l1) : undefined;
    let l2 = await Global.GetStorage(Global.STORAGE_LONGITUDE);
    longitude = l2 ? Number(l2) : undefined;
    setLoading(true);
    await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE).then(
      async (response) => {
        let data: SearchResource = response.data;
        if (!latitude) {
          latitude = data.user.locationLatitude;
        }
        if (!longitude) {
          longitude = data.user.locationLongitude;
        }
        setUser(data.user);
        updateLocationLocal(data.user.locationLatitude, data.user.locationLongitude);
        loadResults();
      }
    );
    setLoading(false);
  }

  async function updateLocationLocal(lat: number, lon: number) {
    await Global.SetStorage(Global.STORAGE_LATITUDE, String(lat));
    latitude = lat;
    await Global.SetStorage(Global.STORAGE_LONGITUDE, String(lon));
    longitude = lon;
  }

  async function loadResults() {

    let lat = latitude;
    let lon = longitude;
    let hasLocation = lat != undefined && lon != undefined;
    if (firstSearch && hasLocation) {
      try {
        let location: Location.LocationObject | undefined;
        let hasLocationPermission = false;
        let hasGpsEnabled = false;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status == 'granted') {
          hasLocationPermission = true;
          try {
            location = await promiseWithTimeout(hasLocation ? LOCATION_TIMEOUT_SHORT : LOCATION_TIMEOUT_LONG, Location.getCurrentPositionAsync({}));
            hasGpsEnabled = true;
            lat = location?.coords.latitude;
            lon = location?.coords.longitude;
          } catch (e) {
          }
        }
        if (!hasLocationPermission) {
          Global.ShowToast(i18n.t('location.no-permission'));
        } else if (!hasGpsEnabled) {
          Global.ShowToast(i18n.t('location.no-signal'));
        }
        setFirstSearch(false);
      } catch (e) {
        console.log(e)
      }
    }

    if (lat != undefined && lon != undefined) {
      let response = await Global.Fetch(Global.format(URL.API_SEARCH_USERS, lat, lon, distance, sort));
      let result: SearchDto = response.data;
      let incompatible = result.incompatible;
      if (!incompatible && result.users) {
        setResults(result.users);
      }
    }
  }

  async function likeUser(index: number, swipe?: boolean) {
    if (index < results.length) {
      let id = results[index].idEncoded;
      await Global.Fetch(Global.format(URL.USER_LIKE, id), 'post');
      loadResultsOnEmpty(index);
    }
  }

  async function hideUser(index: number, swipe?: boolean) {
    if (index < results.length) {
      let id = results[index].idEncoded;
      await Global.Fetch(Global.format(URL.USER_HIDE, id), 'post');
      loadResultsOnEmpty(index);
    }
  }

  async function loadResultsOnEmpty(index: number) {
    if (index == results.length - 1) {
      load();
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      { loading &&
        <View style={{height: height, width: width, justifyContent: 'center', alignItems: 'center', position: "absolute"}} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }
      <View style={{ flex: 1 }}>
       <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>      
          <CardStack
            ref={swiper}
            style={{
              justifyContent: 'flex-end',
              alignItems: 'center' 
            }}
            verticalSwipe={false}
            renderNoMoreCards={() => null}
            key={stackKey}
            onSwipedLeft={(index: number) => { hideUser(index) }}
            onSwipedRight={(index: number) => { likeUser(index) }}>
            {
              results.map((card, index) => (
                <Card key={card.idEncoded}>
                  <CardItem
                    user={card}
                    hasActions={true}
                    unitsImperial={user?.units == UnitsEnum.IMPERIAL}
                    swiper={swiper}
                  />
                </Card>
              ))
            }
          </CardStack>
        </View>
      </View>
    </ScrollView>
  );
};

export default Search;
