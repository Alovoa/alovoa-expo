import React, { useState } from "react";
import { View, Dimensions, RefreshControl, ScrollView } from "react-native";
import CardStack, { Card } from "react-native-card-stack-swiper";
import { CardItem } from "../components";
import { UserDto, SearchResource, SearchDto, UnitsEnum } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import GetLocation, { Location } from 'react-native-get-location';


const i18n = I18N.getI18n()

enum SORT {
  DISTANCE = 1,
  ACTIVE_DATE = 2,
  INTEREST = 3,
  DONATION_LATEST = 4,
  DONATION_TOTAL = 5,
  NEWEST_USER = 6
}

const Search = () => {

  let swiper: any = React.useRef(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = useState(Array<UserDto>);
  const [sort, setSort] = useState(SORT.DONATION_LATEST);
  const [distance, setDistance] = React.useState(50);
  const [stackKey, setStackKey] = React.useState(0);

  let startupLocationAsked: boolean = false;
  let latitude: number | undefined;
  let longitude: number | undefined;

  React.useEffect(() => {
    setStackKey(new Date().getTime());
    for (let i = 0; i < results.length; i++) {
      swiper.current?.goBackFromTop();
    }
  }, [results]);

  async function load() {
    let l1 = await Global.GetStorage(Global.STORAGE_LATITUDE);
    latitude = l1 ? Number(l1) : undefined;
    let l2 = await Global.GetStorage(Global.STORAGE_LONGITUDE);
    longitude = l2 ? Number(l2) : undefined;
    await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE).then(
      async (response) => {
        let data: SearchResource = response.data;
        setUser(data.user);
        updateLocationLocal(data.user.locationLatitude, data.user.locationLongitude);
        loadResults();
      }
    );
  }

  async function updateLocationLocal(lat: number, lon: number) {
    await Global.SetStorage(Global.STORAGE_LATITUDE, String(lat));
    await Global.SetStorage(Global.STORAGE_LONGITUDE, String(lon));
    latitude = lat;
    longitude = lon;
  }

  async function loadResults() {
    let lat = latitude;
    let lon = longitude;

    try {
      if (!startupLocationAsked) {
        let location: Location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 60000,
          rationale: {
            title: i18n.t('location-permission.title'),
            message: i18n.t('location-permission.body'),
            buttonPositive: i18n.t('ok'),
          },
        });
        lat = location.latitude;
        lon = location.longitude;
        startupLocationAsked = true;
      }
    } catch (e) { console.log(e) }

    let response = await Global.Fetch(Global.format(URL.API_SEARCH_USERS, lat, lon, distance, sort));
    let result: SearchDto = response.data;
    let incompatible = result.incompatible;
    if (!incompatible && result.users) {
      setResults(result.users);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

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
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <CardStack
            style={{
              justifyContent: 'flex-end'
            }}
            verticalSwipe={false}
            renderNoMoreCards={() => null}
            ref={swiper}
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
