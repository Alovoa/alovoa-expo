import React from "react";
import {
  View,
  FlatList,
  RefreshControl
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Message } from "../components";
import { ChatsResource, ConversationDto } from "../types";
import styles, { STATUS_BAR_HEIGHT } from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";

const Messages = ({ navigation }) => {

  const i18n = I18N.getI18n()
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<ConversationDto>);

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_CHATS);
    let data: ChatsResource = response.data;
    setResults(data.conversations);
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.containerMatches}>
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Message
            conversation={item}
          />
        )}
      />
    </View>
  )
};

export default Messages;
