import React from "react";
import {
  TouchableOpacity,
  ImageBackground,
  View,
  FlatList,
  RefreshControl
} from "react-native";

import { useTheme, Text, Button, IconButton, Portal, Menu, RadioButton } from "react-native-paper";
import { Icon, Message } from "../components";
import { ChatsResource, UserDto, ConversationDto } from "../types";
import styles, { DARK_GRAY } from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";

const Messages = () => {

  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<ConversationDto>);

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_CHATS);
    let data: ChatsResource = response.data;
    setResults(data.conversations);
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.containerMessages}>
      <View style={styles.top}>
        <Text style={styles.title}>Messages</Text>
        {
          /*<TouchableOpacity>
            <Icon name="ellipsis-vertical" color={DARK_GRAY} size={20} />
          </TouchableOpacity>*/
        }
      </View>

      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => Global.nagivateChatDetails(item.id)}>
            <Message
              image={item.userProfilePicture}
              name={item.userName}
              lastMessage={item.lastMessage}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  )
};

export default Messages;
