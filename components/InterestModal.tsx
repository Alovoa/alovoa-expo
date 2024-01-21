import React from "react";
import { InterestModalT, UserInterest, } from "../types";
import { Modal, Portal, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { View, useWindowDimensions } from "react-native";
import * as Global from "../Global";
import * as I18N from "../i18n";
import { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import InterestView from "./InterestView";

const InterestModal = ({ user }: InterestModalT) => {

  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();

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
          <InterestView data={interests ? interests : []} user={user} updateButtonText={updateButtonText} setInterestsExternal={setInterests} />
        </Modal>
      </Portal>
      <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.onboarding.interests')}</Text>
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default InterestModal;
