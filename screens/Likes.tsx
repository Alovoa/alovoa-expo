import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl
} from "react-native";

import { useTheme, Text, Button, TextInput, Switch, RadioButton, IconButton } from "react-native-paper";
import { CardItem, Icon } from "../components";
import styles from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AlertsResource, NotificationDto, UserDto, UnitsEnum } from "../types";

const Likes = () => {

  const i18n = I18N.getI18n()

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
    <View style={styles.containerMatches} >
      <View style={styles.top}>
        <Text style={styles.title}>{i18n.t('navigation.likes')}</Text>
      </View>


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
    </View>
  )
};

export default Likes;
