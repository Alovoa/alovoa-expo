import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions
} from "react-native";

import { Text } from "react-native-paper";
import { CardItem } from "../components";
import styles, { STATUS_BAR_HEIGHT } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AlertsResource, UserDto, UnitsEnum } from "../types";
import LikesEmpty from "../assets/images/likes-empty.svg";

const Likes = ({ navigation }) => {

  const i18n = I18N.getI18n()

  const [loaded, setLoaded] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = React.useState(Array<UserDto>);
  const { height, width } = Dimensions.get('window');

  const svgHeight = 150;
  const svgWidth = 200;

  async function load() {
    await Global.Fetch(URL.API_RESOURCE_ALERTS).then(
      (response) => {
        let data: AlertsResource = response.data;
        setUser(data.user);
        let users = data.notifications.map(item => {
          return item.userFromDto;
        });
        setResults(users);
      }
    );
    setLoaded(true);
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.containerMatches} >
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
        numColumns={2}
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <CardItem
              user={item}
              hasActions={false}
              unitsImperial={user?.units == UnitsEnum.IMPERIAL}
              hasVariant
            />
          </TouchableOpacity>
        )}
      />
      {results && results.length == 0 && loaded && 
        <View style={{ height: height, width: width, justifyContent: 'center', alignItems: 'center' }}>
          <LikesEmpty height={svgHeight} width={svgWidth}></LikesEmpty>
          <Text style={{ fontSize: 20, paddingHorizontal: 48 }}>{i18n.t('likes-empty.title')}</Text>
          <Text style={{ marginTop: 24, opacity: 0.6, paddingHorizontal: 48 }}>{i18n.t('likes-empty.subtitle')}</Text>
        </View>
      }
    </View>
  )
};

export default Likes;
