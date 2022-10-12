import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  RefreshControl
} from "react-native";
import { CardItem, Icon } from "../components";
import DEMO from "../assets/data/demo";
import styles, { DARK_GRAY } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AlertsResource, NotificationDto, UserDto, UnitsEnum } from "../types";

const Likes = () => {

  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [results, setResults] = React.useState(Array<UserDto>);

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
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <View style={styles.containerMatches} >
        <View style={styles.top}>
          <Text style={styles.title}>Likes</Text>
        </View>


        <FlatList
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
      </View>
    </ScrollView>
  )
};

export default Likes;
