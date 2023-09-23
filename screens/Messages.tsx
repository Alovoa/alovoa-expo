import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import { useTheme, Text } from "react-native-paper";
import { Message } from "../components";
import { ChatsResource, ConversationDto } from "../types";
import { STATUS_BAR_HEIGHT } from "../assets/styles";
import ConvoEmpty from "../assets/images/convo-empty.svg";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import VerticalView from "../components/VerticalView";

const Messages = ({ navigation }) => {

  const i18n = I18N.getI18n()
  const { colors } = useTheme();

  const [loaded, setLoaded] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<ConversationDto>);
  const { height, width } = useWindowDimensions();

  const svgHeight = 150;
  const svgWidth = 200;

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_CHATS);
    let data: ChatsResource = response.data;
    setResults(data.conversations);
    setLoaded(true);
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <VerticalView onRefresh={load}>
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      {
        results.map((item, index) => (
          <Message key={index}
            conversation={item}
          />
        ))
      }
      {results && results.length == 0 && loaded &&
        <View style={{ height: height, width: width, justifyContent: 'center', alignItems: 'center' }}>
          <ConvoEmpty height={svgHeight} width={svgWidth}></ConvoEmpty>
          <Text style={{ fontSize: 20, paddingHorizontal: 48 }}>{i18n.t('convo-empty.title')}</Text>
          <Text style={{ marginTop: 24, opacity: 0.6, paddingHorizontal: 48 }}>{i18n.t('convo-empty.subtitle')}</Text>
        </View>
      }
    </VerticalView>
  )
};

export default Messages;
