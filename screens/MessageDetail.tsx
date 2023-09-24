import React from "react";
import {
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  Dimensions,
  Image,
  ScrollView,
  useWindowDimensions
} from "react-native";
import {
  TextInput, Card
} from "react-native-paper";

import { useTheme, Text } from "react-native-paper";
import { MessageDtoListModel, MessageDto } from "../types";
import styles, { STATUS_BAR_HEIGHT, WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";
import * as WebBrowser from 'expo-web-browser';
import * as I18N from "../i18n";

const i18n = I18N.getI18n()
const SECOND_MS = 1000;
const POLL_MESSAGE = 5 * SECOND_MS;

const MessageDetail = ({ route, navigation }) => {

  const { conversation } = route.params;

  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<MessageDto>);
  let scrollViewRef = React.useRef<ScrollView>(null);
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
    navigation.setOptions({
      title: conversation.userName, headerRight: () => (
        <Image source={{ uri: conversation.userProfilePicture }} style={{ height: 36, width: 36, borderRadius: 36, marginRight: 18 }} />
      )
    });
    load();
    messageUpdateInterval = setInterval(() => {
      reloadMessages(false);
    }, POLL_MESSAGE);
  }, []);

  React.useEffect(() => {
    scrollToEnd();
  }, [results]);

  function scrollToEnd() {
    setTimeout(function () {
      scrollViewRef?.current?.scrollToEnd();
    }, 100);
  }

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
    marginLeft: 4,
    marginRight: 4,
    marginBottom: 6,
    padding: 10,
    borderRadius: 10,
    maxWidth: width * 0.85,
  }

  return (
    <View style={[styles.containerMessages, { paddingHorizontal: 0 }]}>
      <ScrollView
        style={{ margin: 8 }}
        ref={scrollViewRef}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        {
          results.map((item, index) => (
            <View key={index} style={[{ flex: 1 }, item.from ? {alignItems : 'flex-start'} : { alignItems: 'flex-end' }]}>
              <Card style={[styleChat, item.from ? {} : styleYourChat]} >
                {!item.allowedFormatting && <Text style={[item.from ? {} : styleYourChat]}>{item.content}</Text>}
                {item.allowedFormatting && <Text style={[{ textDecorationLine: 'underline' }, item.from ? {} : styleYourChat]} onPress={() => {
                  WebBrowser.openBrowserAsync(item.content);
                }}>{item.content}</Text>}
              </Card>
            </View>
          ))
        }
      </ScrollView>
      <KeyboardAvoidingView style={{ marginTop: 8 }}>
        <TextInput
          onPressIn={scrollToEnd}
          style={{ backgroundColor: colors.surface }}
          value={text}
          dense={true}
          onChangeText={text => setText(text)}
          onSubmitEditing={sendMessage}
          placeholder={i18n.t('chat.placeholder')}
          right={<TextInput.Icon iconColor={colors.secondary} onPress={() => sendMessage()} icon="send" />}></TextInput>
      </KeyboardAvoidingView>
    </View>
  )
};

export default MessageDetail;
