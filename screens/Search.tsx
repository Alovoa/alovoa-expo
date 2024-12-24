import React, { useState } from "react";
import { View, RefreshControl, ScrollView, useWindowDimensions } from "react-native";
import CardStack, { Card } from "react-native-card-stack-swiper";
import { UserDto, SearchResource, SearchDto, UnitsEnum, SearchParams, SearchParamsSortE } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as Location from 'expo-location';
import { ActivityIndicator, Text, Button, IconButton } from "react-native-paper";
import CardItemSearch from "../components/CardItemSearch";
import { useFocusEffect } from "@react-navigation/native";
import ComplimentModal from "../components/ComplimentModal";
import SearchEmpty from "../assets/images/search-empty.svg";
import styles, { WIDESCREEN_HORIZONTAL_MAX, STATUS_BAR_HEIGHT } from "../assets/styles";

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
  const [index, setIndex] = React.useState(0);
  const [currentUser, setCurrentUser] = React.useState<UserDto>();
  const [complimentModalVisible, setComplimentModalVisible] = React.useState(false);
  const [ignoreRightSwipe, setIgnoreRightSwipe] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  let latitude: number | undefined;
  let longitude: number | undefined;

  const svgHeight = 150;
  const svgWidth = 200;

  const MIN_AGE = 16;
  const MAX_AGE = 100;

  const { height, width } = useWindowDimensions();

  const LOCATION_TIMEOUT_SHORT = 6000;
  const LOCATION_TIMEOUT_LONG = 10000;

  const promiseWithTimeout = (timeoutMs: number, promise: Promise<any>) => {
    return Promise.race([
      promise,
      new Promise((_resolve, reject) => setTimeout(() => reject(), timeoutMs)),
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
    if (results[index]) {
      setCurrentUser(results[index]);
    }
  }, [index, results]);

  useFocusEffect(
    React.useCallback(() => {
      Global.GetStorage(Global.STORAGE_RELOAD_SEARCH).then(value => {
        if (value) {
          load();
          Global.SetStorage(Global.STORAGE_RELOAD_SEARCH, "");
        }
      });
    }, [route, navigation])
  );

  React.useEffect(() => {
    if (route.params?.changed) {
      swiper.current?.swipeTop();
      let resultsCopy = [...results];
      resultsCopy.shift();
      setResults(resultsCopy);
      route.params.changed = false;
      if (resultsCopy.length == 0) {
        load();
      }
    }
  }, [route.params?.changed]);

  async function load() {
    setLoaded(false);
    setResults([]);
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
        await updateLocationLocal(data.user.locationLatitude, data.user.locationLongitude);
        await loadResults();
      }
    );
    setLoading(false);
    setIndex(0);
    setLoaded(true);
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
    if (firstSearch) {
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
      let params: SearchParams = {
        distance: 50,
        showOutsideParameters: true,
        sort: SearchParamsSortE.DEFAULT,
        latitude: lat,
        longitude: lon,
        //preferredMinAge: user?.preferedMinAge ? user.preferedMinAge : MIN_AGE,
        //preferredMaxAge: user?.preferedMaxAge ? user.preferedMaxAge : MAX_AGE,
        miscInfos: [],
        intentions: [],
        interests: [],
        preferredGenderIds: user ? user.preferedGenders.map(gender => gender.id) : []
      };

      console.log(params)
      let response = await Global.Fetch(URL.API_SEARCH, 'post', params);
      let result: SearchDto = response.data;
      let incompatible = result.incompatible;
      if (!incompatible && result.users) {
        setResults(result.users);
      }
    }
  }

  async function likeUser(message?: string, pop?: boolean) {
    if (index < results.length) {
      let id = results[index].uuid;
      if (!message) {
        await Global.Fetch(Global.format(URL.USER_LIKE, id), 'post');
      } else {
        await Global.Fetch(Global.format(URL.USER_LIKE_MESSAGE, id, message), 'post');
      }
      if (pop) {
        swiper.current?.swipeRight();
      }
      loadResultsOnEmpty(index);
      setComplimentModalVisible(false);
    }
  }

  async function hideUser(index: number) {
    if (index < results.length) {
      let id = results[index].uuid;
      await Global.Fetch(Global.format(URL.USER_HIDE, id), 'post');
      loadResultsOnEmpty(index);
    }
    setIndex(index + 1);
  }

  async function loadResultsOnEmpty(index: number) {
    if (index == results.length - 1) {
      load();
    }
  }

  async function onSwipeRight(index: number) {
    if (!ignoreRightSwipe) {
      likeUser(undefined, false);
    }
    setIndex(index + 1);
  }

  async function onLikePressed() {
    if (index < results.length) {
      let likesMe = results[index].likesCurrentUser;
      if(!likesMe) {
        setComplimentModalVisible(true);
        setIgnoreRightSwipe(true);
      } else {
        likeUser(undefined, false);
      }
    }
  }

  function onComplimentModalDismiss() {
    setIgnoreRightSwipe(false);
  }

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        
      {loading &&
        <View style={{ height: height, width: width, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <View style={[styles.top, { zIndex: 1, position: "absolute", width: '100%', marginHorizontal: 0, paddingTop: STATUS_BAR_HEIGHT + 4, justifyContent: 'flex-end' }]}>
        { width > WIDESCREEN_HORIZONTAL_MAX &&
          <Button icon="cog" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
                      style={{ alignSelf: 'stretch', marginBottom: 8 }} onPress={() => Global.navigate(Global.SCREEN_PROFILE_SEARCHSETTINGS, false, {})}>
                        {i18n.t('profile.screen.search')}</Button>
        }
        { width <= WIDESCREEN_HORIZONTAL_MAX &&
        <IconButton
          icon="cog"
          mode="contained"
          size={20}
          onPress={() => Global.navigate(Global.SCREEN_PROFILE_SEARCHSETTINGS, false, {})}
        />
        }
      </View>

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
            onSwipedLeft={hideUser}
            onSwipedRight={onSwipeRight}>
            {
              results.map((card, index) => (
                <Card key={card.uuid}>
                  <CardItemSearch
                    user={card}
                    unitsImperial={user?.units == UnitsEnum.IMPERIAL}
                    swiper={swiper}
                    onLikePressed={onLikePressed}
                    index={index}
                  />
                </Card>
              ))
            }
          </CardStack>
        </View>
      </View>
      {results && results.length == 0 && loaded &&
        <View style={{ height: height, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.center, { maxWidth: WIDESCREEN_HORIZONTAL_MAX }]}>
            <SearchEmpty height={svgHeight} width={svgWidth}></SearchEmpty>
            <Text style={{ fontSize: 20, paddingHorizontal: 48, marginTop: 8 }}>{i18n.t('search-empty.title')}</Text>
            <Text style={{ marginTop: 24, opacity: 0.6, paddingHorizontal: 48, textAlign: 'center' }}>{i18n.t('search-empty.subtitle')}</Text>
            <Button onPress={() => Global.navigate("YourProfile")}>{i18n.t('search-empty.button')}</Button>
          </View>
        </View>
      }
      <ComplimentModal profilePicture={currentUser ? currentUser.profilePicture : ''} name={currentUser ? currentUser.firstName : ''}
        age={currentUser ? currentUser.age : 0} onSend={likeUser} visible={complimentModalVisible} setVisible={setComplimentModalVisible}
        onDismiss={onComplimentModalDismiss}></ComplimentModal>
    </ScrollView>
  );
};

export default Search;
