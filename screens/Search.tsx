import React, { useState } from "react";
import { View, RefreshControl, ScrollView, useWindowDimensions } from "react-native";
import CardStack from "../components/CardStack";
import {
  UserDto,
  SearchResource,
  SearchDto,
  UnitsEnum,
  SearchParams,
  SearchParamsSortE,
  RootStackParamList
} from "../myTypes";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as Location from "expo-location";
import { ActivityIndicator, Text, Button, IconButton, useTheme } from "react-native-paper";
import CardItemSearch from "../components/CardItemSearch";
import { useFocusEffect } from "@react-navigation/native";
import ComplimentModal from "../components/ComplimentModal";
import SearchEmpty from "../assets/images/search-empty.svg";
import styles, { WIDESCREEN_HORIZONTAL_MAX, STATUS_BAR_HEIGHT } from "../assets/styles";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

const i18n = I18N.getI18n();

type Props = BottomTabScreenProps<RootStackParamList, "Search">;

const Search = ({ route, navigation }: Props) => {
  const { colors } = useTheme();

  const [refreshing] = useState(false);
  const [user, setUser] = useState<UserDto>();
  const [results, setResults] = useState<UserDto[]>([]);
  const [firstSearch, setFirstSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDto>();
  const [complimentModalVisible, setComplimentModalVisible] = useState(false);
  const [tapEnabled, setTapEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  let latitude: number | undefined;
  let longitude: number | undefined;

  const { height, width } = useWindowDimensions();

  const LOCATION_TIMEOUT_SHORT = Global.DEFAULT_GPS_TIMEOUT;
  const LOCATION_TIMEOUT_LONG = LOCATION_TIMEOUT_SHORT * 10;

  const promiseWithTimeout = (timeoutMs: number, promise: Promise<any>) => {
    return Promise.race([
      promise,
      new Promise((_resolve, reject) => setTimeout(() => reject(), timeoutMs)),
    ]);
  };

  React.useEffect(() => {
    Global.SetStorage(Global.STORAGE_SEARCH_REMOVE_TOP, Global.STORAGE_FALSE);
    load();
  }, []);

  React.useEffect(() => {
    setCurrentUser(results[0]);
  }, [results]);

  useFocusEffect(
    React.useCallback(() => {
      Global.GetStorage(Global.STORAGE_RELOAD_SEARCH).then(value => {
        if (value === Global.STORAGE_TRUE) {
          load();
          Global.SetStorage(Global.STORAGE_RELOAD_SEARCH, "");
        } else {
          Global.GetStorage(Global.STORAGE_SEARCH_REMOVE_TOP).then(value => {
            if (value === Global.STORAGE_TRUE) {
              setResults(prev => prev.slice(1));
              if (results.length <= 1) load();
            }
            Global.SetStorage(Global.STORAGE_SEARCH_REMOVE_TOP, Global.STORAGE_FALSE);
          });
        }
      });
    }, [results])
  );

  async function load() {
    setLoaded(false);
    setResults([]);
    setLoading(true);

    let l1 = await Global.GetStorage(Global.STORAGE_LATITUDE);
    latitude = l1 ? Number(l1) : undefined;

    let l2 = await Global.GetStorage(Global.STORAGE_LONGITUDE);
    longitude = l2 ? Number(l2) : undefined;

    await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE).then(async (response) => {
      let data: SearchResource = response.data;

      if (!latitude) latitude = data.user.locationLatitude;
      if (!longitude) longitude = data.user.locationLongitude;

      setUser(data.user);
      await updateLocationLocal(latitude!, longitude!);
      await loadResults();
    });

    setLoading(false);
    setLoaded(true);
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

    if (firstSearch) {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          try {
            let location = await promiseWithTimeout(
              LOCATION_TIMEOUT_SHORT,
              Location.getCurrentPositionAsync({})
            );
            lat = location.coords.latitude;
            lon = location.coords.longitude;
          } catch {}
        }
        setFirstSearch(false);
      } catch {}
    }

    if (lat !== undefined && lon !== undefined) {
      let paramsStorage = await Global.GetStorage(Global.STORAGE_ADV_SEARCH_PARAMS);
      let storedParams: SearchParams = paramsStorage ? JSON.parse(paramsStorage) : {};

      let searchParams: SearchParams = {
        distance: storedParams?.distance ?? Global.DEFAULT_DISTANCE,
        showOutsideParameters: storedParams?.showOutsideParameters ?? true,
        sort: SearchParamsSortE.DEFAULT,
        latitude: lat,
        longitude: lon,
        miscInfos: [],
        intentions: [],
        interests: [],
        preferredGenderIds: user ? user.preferedGenders.map(g => g.id) : [],
      };

      let response = await Global.Fetch(URL.API_SEARCH, "post", searchParams);
      let result: SearchDto = response.data;
      if (result.users) {
        setResults(result.users);
      }
    }
  }

  async function likeUser(message?: string) {
    const current = results[0];
    if (!current) return;

    let id = current.uuid;

    if (!message) {
      await Global.Fetch(Global.format(URL.USER_LIKE, id), "post");
    } else {
      await Global.Fetch(Global.format(URL.USER_LIKE_MESSAGE, id, message), "post");
    }

    setResults(prev => prev.slice(1));
    setComplimentModalVisible(false);
  }

  async function hideUser() {
    const current = results[0];
    if (!current) return;

    let id = current.uuid;

    await Global.Fetch(Global.format(URL.USER_HIDE, id), "post");
    setResults(prev => prev.slice(1));
  }

  function onLikePressed() {
    const current = results[0];
    if (!current) return;

    if (!current.likesCurrentUser) {
      setComplimentModalVisible(true);
    } else {
      likeUser();
    }
  }

  function openSearchSetting() {
    Global.navigate(Global.SCREEN_PROFILE_SEARCHSETTINGS, false, {});
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.background, flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
      >
        {loading && (
          <View style={{ height, width, justifyContent: "center", alignItems: "center", position: "absolute" }}>
            <ActivityIndicator animating size="large" />
          </View>
        )}

        <View style={[styles.top, { position: "absolute", width: "100%", zIndex: 100, paddingTop: STATUS_BAR_HEIGHT + 8 }]}>
          {width > WIDESCREEN_HORIZONTAL_MAX ? (
            <Button onPress={openSearchSetting}>{i18n.t("profile.screen.search")}</Button>
          ) : (
            <IconButton icon="cog" onPress={openSearchSetting} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <CardStack
            data={results}
            renderCard={(card) => (
              <CardItemSearch
                user={card}
                unitsImperial={user?.units === UnitsEnum.IMPERIAL}
                onLikePressed={onLikePressed}
                tapEnabled={tapEnabled}
                setTapEnabled={setTapEnabled}
              />
            )}
            onSwipeLeft={hideUser}
            onSwipeRight={() => likeUser()}
            onSwipeUp={hideUser}
            tapEnabled={tapEnabled}
            setTapEnabled={setTapEnabled}
          />
        </View>

        {results.length === 0 && loaded && (
          <View style={{ height, justifyContent: "center", alignItems: "center" }}>
            <SearchEmpty height={150} width={200} />
            <Text>{i18n.t("search-empty.title")}</Text>
            <Button onPress={openSearchSetting}>
              {i18n.t("search-empty.button")}
            </Button>
          </View>
        )}
      </ScrollView>

      <ComplimentModal
        profilePicture={currentUser?.profilePicture || ""}
        name={currentUser?.firstName || ""}
        age={currentUser?.age || 0}
        onSend={likeUser}
        visible={complimentModalVisible}
        setVisible={setComplimentModalVisible}
      />
    </View>
  );
};

export default Search;