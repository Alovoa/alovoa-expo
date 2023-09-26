import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Pressable,
  useWindowDimensions
} from "react-native";

import { ActivityIndicator, Button, Menu, Text, useTheme } from "react-native-paper";
import { CardItemLikes } from "../components";
import styles, { STATUS_BAR_HEIGHT } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AlertsResource, UserDto, UnitsEnum, UserUsersResource } from "../types";
import LikesEmpty from "../assets/images/likes-empty.svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VerticalView from "../components/VerticalView";

const Likes = ({ navigation }) => {

  const { colors } = useTheme();
  const i18n = I18N.getI18n()

  enum FILTER {
    RECEIVED_LIKES,
    GIVEN_LIKES,
    HIDDEN,
    BLOCKED
  }

  const [loaded, setLoaded] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = React.useState(Array<UserDto>);
  const [menuFilterVisible, setMenuFilterVisible] = React.useState(false);
  const [filter, setFilter] = React.useState(FILTER.RECEIVED_LIKES);
  const [loading, setLoading] = React.useState(false);
  const { height, width } = useWindowDimensions();

  const svgHeight = 150;
  const svgWidth = 200;
  const topBarHeight = 62;

  async function load() {
    setLoading(true);
    setMenuFilterVisible(false);

    let url;
    switch (filter) {
      case FILTER.RECEIVED_LIKES: url = URL.API_RESOURCE_ALERTS; break;
      case FILTER.GIVEN_LIKES: url = URL.API_RESOURCE_USER_LIKED; break;
      case FILTER.HIDDEN: url = URL.API_RESOURCE_USER_HIDDEN; break;
      case FILTER.BLOCKED: url = URL.API_RESOURCE_USER_BLOCKED; break;
    }
    if (url) {
      await Global.Fetch(url).then(
        (response) => {
          if (filter == FILTER.RECEIVED_LIKES) {
            let data: AlertsResource = response.data;
            setUser(data.user);
            let users = data.notifications.map(item => {
              return item.userFromDto;
            });
            setResults(users);
          } else {
            let data: UserUsersResource = response.data;
            setUser(data.user);
            setResults(data.users);
          }
        }
      );
      setLoaded(true);
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (filter != FILTER.RECEIVED_LIKES) {
        setFilter(FILTER.RECEIVED_LIKES);
      } else {
        load();
      }
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    load();
  }, [filter]);

  return (
    <View style={{ height: height }}>
      {loading &&
        <View style={{ zIndex: 1, height: height, width: width, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <View style={[styles.top, { paddingBottom: 8, justifyContent: 'space-between', width: width }]}>
        {filter == FILTER.RECEIVED_LIKES && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.received-likes')}</Text>}
        {filter == FILTER.GIVEN_LIKES && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.given-likes')}</Text>}
        {filter == FILTER.HIDDEN && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.hidden')}</Text>}
        {filter == FILTER.BLOCKED && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.blocked')}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Menu
            visible={menuFilterVisible}
            onDismiss={() => setMenuFilterVisible(false)}
            anchor={<Pressable onPress={() => setMenuFilterVisible(true)}><MaterialCommunityIcons name="dots-vertical" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>}>
            {filter != FILTER.RECEIVED_LIKES && <Menu.Item onPress={() => setFilter(FILTER.RECEIVED_LIKES)} title={i18n.t('likes.received-likes')} />}
            {filter != FILTER.GIVEN_LIKES && <Menu.Item onPress={() => setFilter(FILTER.GIVEN_LIKES)} title={i18n.t('likes.given-likes')} />}
            {filter != FILTER.HIDDEN && <Menu.Item onPress={() => setFilter(FILTER.HIDDEN)} title={i18n.t('likes.hidden')} />}
            {filter != FILTER.BLOCKED && <Menu.Item onPress={() => setFilter(FILTER.BLOCKED)} title={i18n.t('likes.blocked')} />}
          </Menu>
        </View>
      </View>
      <VerticalView onRefresh={load} style={{ paddingBottom: topBarHeight + 24 }}>
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
          numColumns={2}
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <CardItemLikes
                user={item}
                unitsImperial={user?.units == UnitsEnum.IMPERIAL}
              />
            </TouchableOpacity>
          )}
        />
        {results && results.length == 0 && loaded && filter == FILTER.RECEIVED_LIKES &&
          <View style={{ height: height, width: width, justifyContent: 'center', alignItems: 'center' }}>
            <LikesEmpty height={svgHeight} width={svgWidth}></LikesEmpty>
            <Text style={{ fontSize: 20, paddingHorizontal: 48 }}>{i18n.t('likes-empty.title')}</Text>
            <Text style={{ marginTop: 24, opacity: 0.6, paddingHorizontal: 48 }}>{i18n.t('likes-empty.subtitle')}</Text>
          </View>
        }
      </VerticalView>
    </View>
  )
};

export default Likes;
