import React, { useState } from "react";
import { View, ImageBackground, FlatList, Dimensions, RefreshControl } from "react-native";
import CardStack, { Card } from "react-native-card-stack-swiper";
import { Filters, CardItem } from "../components";
import styles from "../assets/styles";
import { UserDto, SearchResource, SearchDto } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as Location from 'expo-location';
import { ScrollView } from "react-native-gesture-handler";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';


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
  const TAB_BAR_HEIGHT = useBottomTabBarHeight();
  const WINDOW_HEIGHT = Dimensions.get('window').height;
  const HEIGHT = WINDOW_HEIGHT - TAB_BAR_HEIGHT;

  
  const [refreshing, setRefreshing] = React.useState(false);
  const [swiper, setSwiper] = useState<CardStack | null>();
  const [results, setResults] = useState(Array<UserDto>);
  const [sort, setSort] = useState(SORT.DONATION_LATEST);
  const [distance, setDistance] = useState(50);
  const [stackKey, setStackKey] = React.useState(0); 

  React.useEffect(() => {
    setStackKey(new Date().getTime());
    for (let i = 0; i < results.length; i++) {
      console.log(results[i].idEncoded);
      swiper?.goBackFromTop();
    }
  }, [results]);

  async function load() {
    await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE).then(
      (response) => {
        let data: SearchResource = response.data;
        if (!data.user.locationLatitude) {
          loadResults();
        } else {
          loadResultsDefault();
        }
      }
    );
  }

  async function loadResultsDefault() {
    let response = await Global.Fetch(Global.format(URL.API_SEARCH_USERS_DEFAULT));
    let result: SearchDto = response.data;
    let incompatible = result.incompatible;
    if (!incompatible && result.users) {
      setResults(result.users);
    }
  }

  async function loadResults() {

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      //TODO
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let lat = location.coords.latitude;
    let lon = location.coords.longitude;

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
    console.log("index: ", index)
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

  let cards = () => {
    return results.map((card, index) => (
      <Card key={card.idEncoded}
        style={{ flex: 1 }}>
        <CardItem
          user={card}
          hasActions={true}
          swiper={swiper}
        />
      </Card>
    ))
  }
  return (
    <ScrollView style={{ height: HEIGHT }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <View style={{ flex: 1, height: HEIGHT }}>
        <View style={[styles.top, { justifyContent: 'flex-end' }]}>
          {/*<Filters />*/}
        </View>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <CardStack
            style={{
              flex: 1,
              justifyContent: 'flex-end'
            }}
            verticalSwipe={false}
            renderNoMoreCards={() => null}
            ref={(newSwiper): void => setSwiper(newSwiper)}
            key={stackKey}
            onSwipedLeft={(index: number) => { hideUser(index) }}
            onSwipedRight={(index: number) => { likeUser(index) }}>
            {
              results.map((card, index) => (
                <Card key={card.idEncoded}
                  style={{ flex: 1 }}>
                  <CardItem
                    user={card}
                    hasActions={true}
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
