import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Pressable,
  useWindowDimensions,
  Image
} from "react-native";

import { ActivityIndicator, IconButton, Menu, Modal, Portal, Text, useTheme } from "react-native-paper";
import { CardItemLikes } from "../components";
import styles, { NAVIGATION_BAR_HEIGHT, STATUS_BAR_HEIGHT, WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AlertsResource, UserDto, UnitsEnum, UserUsersResource, LikeResultT, RootStackParamList } from "../types";
import LikesEmpty from "../assets/images/likes-empty.svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VerticalView from "../components/VerticalView";
import type { MaterialBottomTabScreenProps } from 'react-native-paper';

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Likes'>
const Likes = ({ navigation }: Props) => {

  const { colors } = useTheme();
  const i18n = I18N.getI18n()

  enum FILTER {
    RECEIVED_LIKES,
    GIVEN_LIKES,
    HIDDEN,
    BLOCKED
  }

  const [loaded, setLoaded] = React.useState(false);
  const [refreshing] = React.useState(false); // todo: setRefreshing
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = React.useState(Array<LikeResultT>);
  const [menuFilterVisible, setMenuFilterVisible] = React.useState(false);
  const [filter, setFilter] = React.useState(FILTER.RECEIVED_LIKES);
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [likeResult, setLikeResult] = React.useState<LikeResultT>();
  const { height, width } = useWindowDimensions();

  const svgHeight = 150;
  const svgWidth = 200;
  const topBarHeight = 62;

  const containerStyle = { backgroundColor: colors.surface, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

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
          if (filter === FILTER.RECEIVED_LIKES) {
            let data: AlertsResource = response.data;
            setUser(data.user);
            let res = data.notifications.map(item => {
              let t = {} as LikeResultT;
              t.message = item.message;
              t.user = item.userFromDto;
              return t;
            });
            setResults(res);
          } else {
            let data: UserUsersResource = response.data;
            setUser(data.user);
            let res = data.users.map(item => {
              let t = {} as LikeResultT;
              t.user = item;
              return t;
            });
            setResults(res);
          }
        }
      );
      setLoaded(true);
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (filter !== FILTER.RECEIVED_LIKES) {
        load();
      }
      setFilter(FILTER.RECEIVED_LIKES);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    setVisible(false);
    load();
  }, [filter]);

  function onMessagePressed(result: LikeResultT) {
    setLikeResult(result);
    showModal();
  }

  return (
    <View style={{ flex: 1, height: height, backgroundColor: colors.background }}>
      {loading &&
        <View style={{ zIndex: 1, height: height, width: width, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <View style={[styles.top, { paddingBottom: 8, justifyContent: 'space-between', width: width }]}>
        {filter === FILTER.RECEIVED_LIKES && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.received-likes')}</Text>}
        {filter === FILTER.GIVEN_LIKES && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.given-likes')}</Text>}
        {filter === FILTER.HIDDEN && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.hidden')}</Text>}
        {filter === FILTER.BLOCKED && <Text style={{ paddingLeft: 12 }}>{i18n.t('likes.blocked')}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Menu
            visible={menuFilterVisible}
            onDismiss={() => setMenuFilterVisible(false)}
            anchor={<Pressable onPress={() => setMenuFilterVisible(true)}><MaterialCommunityIcons name="dots-vertical" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>}>
            {filter !== FILTER.RECEIVED_LIKES && <Menu.Item onPress={() => setFilter(FILTER.RECEIVED_LIKES)} title={i18n.t('likes.received-likes')} />}
            {filter !== FILTER.GIVEN_LIKES && <Menu.Item onPress={() => setFilter(FILTER.GIVEN_LIKES)} title={i18n.t('likes.given-likes')} />}
            {filter !== FILTER.HIDDEN && <Menu.Item onPress={() => setFilter(FILTER.HIDDEN)} title={i18n.t('likes.hidden')} />}
            {filter !== FILTER.BLOCKED && <Menu.Item onPress={() => setFilter(FILTER.BLOCKED)} title={i18n.t('likes.blocked')} />}
          </Menu>
        </View>
      </View>
      <VerticalView onRefresh={load} style={{ paddingBottom: topBarHeight + 24 }}>
        <FlatList
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
          numColumns={2}
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <CardItemLikes
                user={item.user}
                unitsImperial={user?.units === UnitsEnum.IMPERIAL}
                message={item.message}
                onMessagePressed={onMessagePressed}
              />
            </TouchableOpacity>
          )}
        />
        {results && results.length === 0 && loaded && filter === FILTER.RECEIVED_LIKES &&
          <View style={{ height: height - NAVIGATION_BAR_HEIGHT - topBarHeight, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <LikesEmpty height={svgHeight} width={svgWidth}></LikesEmpty>
            <Text style={{ fontSize: 20, paddingHorizontal: 48 }}>{i18n.t('likes-empty.title')}</Text>
            <Text style={{ marginTop: 24, opacity: 0.6, paddingHorizontal: 48, textAlign: 'center' }}>{i18n.t('likes-empty.subtitle')}</Text>
          </View>
        }
      </VerticalView>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle} >
          <View>
            <IconButton
              style={{ alignSelf: 'flex-end' }}
              icon="close"
              size={20}
              onPress={hideModal}
            />
          </View>
          <View style={{ padding: 12, alignItems: 'center', marginBottom: 24 }}>
            <Image style={{ height: 80, width: 80, borderRadius: 500, marginBottom: 12 }} source={{ uri: likeResult?.user.profilePicture }}></Image>
            <Text>{likeResult?.user.firstName + ", " + likeResult?.user.age}</Text>
          </View>
          <View>
            <Text style={{ textAlign: "center" }}>{likeResult?.message}</Text>
          </View>
        </Modal>
      </Portal>
    </View>
  )
};

export default Likes;
