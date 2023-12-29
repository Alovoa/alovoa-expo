
import * as React from 'react';
import { Button, IconButton, Modal, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { ComplimentModalT } from '../types';
import { View, Image, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';
import * as I18N from "../i18n";

const ComplimentModal = ({ visible = false, setVisible, name, age, profilePicture, onSend, onDismiss }: ComplimentModalT) => {

  const { height, width } = useWindowDimensions();
  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const [text, setText] = React.useState("");
  const containerStyle = { backgroundColor: colors.surface, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }
  const showModal = () => setVisible(true);
  const hideModal = () => { setVisible(false); if (onDismiss) { onDismiss() } };
  const maxLength = 120;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle} >
        <View>
          <IconButton
            style={{ alignSelf: 'flex-end' }}
            icon="close"
            size={20}
            onPress={hideModal}
          />
        </View>
        <View style={{ padding: 12, alignItems: 'center', marginBottom: 24 }}>
          <Image style={{ height: 80, width: 80, borderRadius: 500, marginBottom: 12 }} source={{ uri: profilePicture ? profilePicture : undefined }}></Image>
          <Text>{name + ", " + age}</Text>
        </View>
        <View>
          <KeyboardAvoidingView>
            <TextInput
              style={{ backgroundColor: colors.surface, height: 52 }}
              value={text}
              dense={true}
              onChangeText={text => setText(text)}
              onSubmitEditing={() => onSend(text, true)}
              placeholder={i18n.t('compliment.title')}
              maxLength={maxLength}
              right={<TextInput.Icon iconColor={colors.secondary} onPress={() => onSend(text, true)} icon="send" />}></TextInput>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Portal>
  );
};

export default ComplimentModal;
