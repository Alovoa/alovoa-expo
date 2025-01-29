import React from "react";
import {
  View,
  RefreshControl,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  ScrollView,
  useWindowDimensions
} from "react-native";
import {
  TextInput, Card, MaterialBottomTabScreenProps
} from "react-native-paper";
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Autolink, { CustomMatcher } from 'react-native-autolink';
import { MessageDtoListModel, MessageDto, RootStackParamList } from "../types";
import styles from "../assets/styles";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";

const i18n = I18N.getI18n()
const SECOND_MS = 1000;
const POLL_MESSAGE = 5 * SECOND_MS;

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'MessageDetail'>
const MessageDetail = ({ route, navigation }: Props) => {

  const { conversation } = route.params;
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<MessageDto>);
  let scrollViewRef = React.useRef<ScrollView>(null);
  const [text, setText] = React.useState("");

  const PhoneMatcher: CustomMatcher = {
    pattern:
      /(?<=^|\s|\.)[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{0,6}(?=$|\s|\.)/gm,
    type: 'phone-intl',
    getLinkUrl: ([number]) => `tel:${number}`,
  };

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
      title: conversation.userName, tabBarIcon: () => (
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
    <View style={[styles.containerMessages, { paddingHorizontal: 0, display: 'flex', maxHeight: height, marginBottom: insets.bottom }]}>
      <ScrollView
        style={{ padding: 8, flexGrow: 1 }}
        ref={scrollViewRef}
        contentContainerStyle={{paddingBottom: 8}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
        {
          results.map((item, index) => (
            <View key={index} style={[{ flex: 1 }, item.from ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
              <Card style={[styleChat, item.from ? {} : styleYourChat]} >
                {<Autolink style={[item.from ? {} : styleYourChat]} text={item.content} linkStyle={{textDecorationLine: 'underline'}} email={false} phone={true} matchers={[PhoneMatcher]} component={Text}></Autolink>}
              </Card>
            </View>
          ))
        }
      </ScrollView>
      <KeyboardAvoidingView>
        <TextInput
          style={{ backgroundColor: colors.surface, height: 52 }}
          value={text}
          dense={true}
          maxLength={Global.MAX_MESSAGE_LENGTH}
          onChangeText={text => setText(text)}
          onSubmitEditing={sendMessage}
          placeholder={i18n.t('chat.placeholder')}
          right={<TextInput.Icon color={colors.secondary} onPress={() => sendMessage()} icon="send" />}></TextInput>
      </KeyboardAvoidingView>
    </View>
  )
};

export default MessageDetail;
