import React from "react";
import { InterestModalT, UserInterest, } from "../types";
import { Text, Button, useTheme, IconButton, Badge } from 'react-native-paper';
import { KeyboardAvoidingView, View, useWindowDimensions } from "react-native";
import * as Global from "../Global";
import * as I18N from "../i18n";
import styles, { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import InterestView from "./InterestView";
import Modal from "react-native-modal";

const InterestModal = ({ user }: InterestModalT) => {

  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [interests, setInterests] = React.useState(user?.interests);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  function updateButtonText(interests: UserInterest[]) {
    let text = interests.map(item => item.text).join(", ");
    if (!text) {
      text = Global.EMPTY_STRING;
    }
    setButtonText(text);
  }

  React.useEffect(() => {
    if (user) updateButtonText(user.interests);
  }, []);

  return (
    <View>
      <Modal
        isVisible={visible}
        onBackdropPress={hideModal}
        avoidKeyboard={false}
        style={{ justifyContent: 'center', margin: 0 }}>
        <KeyboardAvoidingView behavior="padding" >
          <View style={containerStyle}>
            <View>
              <IconButton
                style={{ alignSelf: 'flex-end' }}
                icon="close"
                size={20}
                onPress={hideModal}
              />
            </View>
            <InterestView data={interests ? interests : []} user={user} updateButtonText={updateButtonText} setInterestsExternal={setInterests} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.onboarding.interests')}</Text>
      <Badge size={12} visible={interests === undefined || interests.length === 0} style={styles.badge} />
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View >
  );
};

export default InterestModal;
