import * as React from 'react';
import { IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { ComplimentModalT } from '../types';
import { View, Image, useWindowDimensions, KeyboardAvoidingView } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';
import * as I18N from "../i18n";
import Modal from 'react-native-modal';

const ComplimentModal = ({
  visible = false,
  setVisible,
  name,
  age,
  profilePicture,
  onSend,
  onDismiss
}: ComplimentModalT) => {

  const { width } = useWindowDimensions();
  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const [text, setText] = React.useState("");

  const maxLength = 120;

  const containerStyle = {
    backgroundColor: colors.elevation.level2,
    padding: 24,
    marginHorizontal: calcMarginModal(),
    borderRadius: 8
  };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  const hideModal = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  // Reset field when new profile opens
  React.useEffect(() => {
    setText("");
  }, [profilePicture]);

  return (
    (
      <Modal
        isVisible={visible}
        onBackdropPress={hideModal}
        avoidKeyboard={false}
        style={{ justifyContent: 'center', margin: 0 }}>
        <KeyboardAvoidingView behavior="padding" >
          <View style={{
            backgroundColor: colors.elevation.level2,
            padding: 24,
            marginHorizontal: calcMarginModal(),
            borderRadius: 8
          }}>
            <View>
              <IconButton
                style={{ alignSelf: 'flex-end' }}
                icon="close"
                size={20}
                onPress={hideModal}
              />
            </View>

            <View style={{ padding: 12, alignItems: 'center', marginBottom: 24 }}>
              <Image
                style={{ height: 80, width: 80, borderRadius: 500, marginBottom: 12 }}
                source={{ uri: profilePicture || undefined }}
              />
              <Text>{`${name}, ${age}`}</Text>
            </View>

            <TextInput
              style={{ backgroundColor: colors.elevation.level2, height: 52 }}
              value={text}
              dense
              onChangeText={setText}
              onSubmitEditing={() => onSend(text, true)}
              placeholder={i18n.t('compliment.title')}
              maxLength={maxLength}
              autoCorrect={false}
              right={
                <TextInput.Icon
                  color={colors.secondary}
                  onPress={() => onSend(text, true)}
                  icon="send"
                />
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    ));
};

export default ComplimentModal;
