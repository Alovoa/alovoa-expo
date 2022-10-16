import React from "react";
import { View, Image } from "react-native";
import { Text } from "react-native-paper";
import { MessageT } from "../types";
import styles from "../assets/styles";
import * as I18N from "../i18n";

const i18n = I18N.getI18n()

const Message = ({ image, lastMessage, name }: MessageT) => {
  
  let text : string = lastMessage?.from ? i18n.t('you') + ": " : "";
  text += lastMessage ? lastMessage.content : i18n.t('chat.default');

  return (
  <View style={styles.containerMessage}>
    <Image source={{ uri: image }} style={styles.avatar} />
    <View>
      <Text>{name}</Text>
      <Text numberOfLines={2} style={styles.message}>{text}</Text>
    </View>
  </View>
)};

export default Message;
