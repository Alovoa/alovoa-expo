import React from "react";
import {
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  Image
} from "react-native";
import {
  TextInput, Card
} from "react-native-paper";

import { useTheme, Text, Button, Chip } from "react-native-paper";
import { Icon, Message } from "../components";
import { ChatsResource, MessageDtoListModel, ConversationDto, MessageDto } from "../types";
import styles, { DARK_GRAY } from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";
import { ScrollView } from "react-native-gesture-handler";
import * as WebBrowser from 'expo-web-browser';
import * as I18N from "../i18n";

const i18n = I18N.getI18n()

const SECOND_MS = 1000;
const POLL_MESSAGE = 10 * SECOND_MS;
const DIMENSION_WIDTH = Dimensions.get("window").width;

const MessageDetail = ({ route, navigation }) => {

  const { conversation } = route.params;

  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<MessageDto>);
  let scrollViewRef = React.useRef(null);
  let textInputRef = React.useRef(null);
  const [text, setText] = React.useState("");


  let messageUpdateInterval: NodeJS.Timeout | null = null;

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (messageUpdateInterval) {
        clearInterval(messageUpdateInterval);
      }
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    navigation.setOptions({ title: conversation.userName, headerRight: () => (
      <Image source={{ uri: conversation.userProfilePicture }} style={{height: 36, width: 36, borderRadius: 36, marginRight: 18}} />
    ) });
    load();
    messageUpdateInterval = setInterval(() => {
      reloadMessages(false);
    }, POLL_MESSAGE);
  }, []);

  React.useEffect(() => {
    setTimeout(function() {
      scrollViewRef?.current?.scrollToEnd();
    }  
  ,100);
  }, [results]);

  async function load() {
    reloadMessages(true);
  }

  async function reloadMessages(first: boolean) {
    let firstVal = first ? "1" : "0";
    let response = await Global.Fetch(Global.format(URL.API_MESSAGE_UPDATE, conversation.id, firstVal));
    let data: MessageDtoListModel = response.data;
    if (data.list) {
      setResults(data.list);
    }
  }

  async function sendMessage() {
    await Global.Fetch(Global.format(URL.MESSAGE_SEND, conversation.id), 'post', text, 'text/plain');
    reloadMessages(false);
    setText("");
    Keyboard.dismiss();
  }

  const styleYourChat = {
    color: 'white',
    backgroundColor: colors.primary
  }

  const styleChat = {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    width: DIMENSION_WIDTH * 0.85
  }

  return (
    <View style={[styles.containerMessages, { paddingHorizontal: 0 }]}>
      <ScrollView
      style={{margin: 8}}
        ref={scrollViewRef}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        {
          results.map((item, index) => (
            <View key={index} style={[{ flex: 1 }, item.from ? {} : { alignItems: 'flex-end' }]}>
              <Card style={[styleChat, item.from ? {} : styleYourChat]} >
                {!item.allowedFormatting && <Text>{item.content}</Text>}
                {item.allowedFormatting && <Text style={{textDecorationLine: 'underline'}} onPress={() => {
                  WebBrowser.openBrowserAsync(item.content);
                }}>{item.content}</Text>}
              </Card>
            </View>
          ))
        }
      </ScrollView>
      <KeyboardAvoidingView style={{ marginTop: 8 }}>
        <TextInput 
        style={{backgroundColor: colors.surface}}
          value={text}
          dense={true}
          onChangeText={text => setText(text)}
          onSubmitEditing={sendMessage}
          placeholder={i18n.t('chat.placeholder')}
          ref={textInputRef} right={<TextInput.Icon iconColor={colors.secondary} onPress={() => sendMessage()} icon="send" />}></TextInput>
      </KeyboardAvoidingView>
    </View>
  )
};

export default MessageDetail;
