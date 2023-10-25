import React from "react";
import styles, { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import { Modal, Portal, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { ColorValue, ScrollView, View, useWindowDimensions } from "react-native";
import * as I18N from "../i18n";
import * as Global from "../Global";
import ColorPicker, { Panel1, HueSlider, returnedResults, BrightnessSlider } from 'reanimated-color-picker';

const ColorModal = ({ title }: any) => {

  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const i18n = I18N.getI18n();

  const [primary, setPrimary] = React.useState<string>(Global.DEFAULT_COLOR_PRIMARY);
  const [secondary, setSecondary] = React.useState<string>(Global.DEFAULT_COLOR_SECONDARY);
  const [changed, setChanged] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  React.useEffect(() => {
    if (changed) {
      Global.ShowToast(i18n.t('restart-apply-changes'));
    }
  }, [changed]);

  function primaryColorChanged(color: returnedResults) {
    changePrimaryColor(color.hex)
  }

  function secondaryColorChanged(color: returnedResults) {
    changeSecondaryColor(color.hex);
  }

  function resetPrimaryColor() {
    changePrimaryColor(Global.DEFAULT_COLOR_PRIMARY);
  }

  function resetSecondaryColor() {
    changeSecondaryColor(Global.DEFAULT_COLOR_SECONDARY);
  }

  function changePrimaryColor(hex: string) {
    setPrimary(hex);
    Global.SetStorage(Global.STORAGE_SETTINGS_COLOR_PRIMARY, hex);
    setChanged(true);
  }

  function changeSecondaryColor(hex: string) {
    setSecondary(hex);
    Global.SetStorage(Global.STORAGE_SETTINGS_COLOR_SECONDARY, hex);
    setChanged(true);
  }

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
          <Text style={styles.marginBottom12}>{title}</Text>
          <ScrollView>
            <View style={styles.padding12}>
              <View>
                <Text style={styles.marginBottom8}>{i18n.t('profile.settings.colors.primary')}</Text>
                <ColorPicker value={primary} onComplete={primaryColorChanged}>
                  <BrightnessSlider />
                  <View style={{ paddingTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton
                      icon="arrow-u-left-top"
                      size={14}
                      mode="contained"
                      style={styles.marginRight8}
                      onPress={resetPrimaryColor}
                    />
                    <HueSlider style={{ flexGrow: 1 }} />
                  </View>
                </ColorPicker>
              </View>
            </View>
            <View style={styles.marginBottom12}></View>
            <View style={styles.padding12}>
              <View>
                <Text style={styles.marginBottom8}>{i18n.t('profile.settings.colors.secondary')}</Text>
                <ColorPicker value={secondary} onComplete={secondaryColorChanged}>
                  <BrightnessSlider />
                  <View style={{ paddingTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <IconButton
                      icon="arrow-u-left-top"
                      size={14}
                      mode="contained"
                      style={styles.marginRight8}
                      onPress={resetSecondaryColor}
                    />
                    <HueSlider style={{ flexGrow: 1 }} />
                  </View>
                </ColorPicker>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
      <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.settings.colors.title')}</Text>
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>
        <Text style={{ color: primary }}>{i18n.t('profile.settings.colors.primary')}</Text>
        <Text>, </Text>
        <Text style={{ color: secondary }}>{i18n.t('profile.settings.colors.secondary')}</Text>
      </Button>
    </View>
  );
};

export default ColorModal;
