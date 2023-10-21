import React from "react";
import { View, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { Text } from "react-native-paper";
import { MessageT } from "../types";
import styles, { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";

const i18n = I18N.getI18n()

const Message = ({ conversation }: MessageT) => {

  let text: string = !conversation.lastMessage ? "" : conversation.lastMessage.from ? "" : i18n.t('you') + ": ";
  text += conversation.lastMessage ? conversation.lastMessage.content : i18n.t('chat.default');
  const { height, width } = useWindowDimensions();

  return (
    <View style={{flexDirection: 'row'}}>
      <View>
        <TouchableOpacity onPress={() => Global.nagivateProfile(undefined, conversation.userIdEncoded)} >
          <Image source={{ uri: conversation.userProfilePicture }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      <View style={[{ flexGrow: 1, justifyContent: 'center' }]}>
        <TouchableOpacity onPress={() => Global.nagivateChatDetails(conversation)} >
          <Text>{conversation.userName}</Text>
          <Text numberOfLines={2} style={[styles.message, {maxWidth: (width > WIDESCREEN_HORIZONTAL_MAX ? WIDESCREEN_HORIZONTAL_MAX : width) - 120}]}>{text}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};

export default Message;
