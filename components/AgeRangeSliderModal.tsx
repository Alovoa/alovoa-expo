import React from "react";
import { GRAY, WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import { RangeSliderModalT } from "../myTypes";
import { Modal, Portal, Text, Button, useTheme, IconButton } from 'react-native-paper';
import { View, useWindowDimensions } from "react-native";
import Slider from "@react-native-community/slider";

const AgeRangeSliderModal = ({
  title,
  titleLower,
  titleUpper,
  valueLower = 0,
  valueUpper = 0,
  onValueLowerChanged,
  onValueUpperChanged }: RangeSliderModalT) => {

  const MIN_AGE = 18;
  const MAX_AGE = 100;

  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const [minAgeText, setMinAgeText] = React.useState(MIN_AGE)
  const [maxAgeText, setMaxAgeText] = React.useState(MAX_AGE)
  const [lowerValue, setLowerValue] = React.useState(valueLower);
  const [upperValue, setUpperValue] = React.useState(valueUpper);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  function updateButtonText() {
    let text = lowerValue.toString() + " - " + upperValue.toString();
    setButtonText(text);
  }

  React.useEffect(() => {
    setLowerValue(valueLower)
    setMinAgeText(valueLower);
  }, [valueLower]);

  React.useEffect(() => {
    setUpperValue(valueUpper);
    setMaxAgeText(valueUpper);
  }, [valueUpper]);

  React.useEffect(() => {
    updateButtonText();
  }, [lowerValue, upperValue]);

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
          <Text style={{ marginBottom: 12 }}>{title}</Text>
          <View style={{ padding: 12 }}>
            <View style={{ marginTop: 12, gap: 12 }}>
              <View>
                <View style={{ flexDirection: 'row' }}>
                  <Text>{titleLower}: </Text>
                  <Text>{minAgeText}</Text>
                </View>
                <Slider
                  value={lowerValue}
                  minimumValue={MIN_AGE}
                  maximumValue={upperValue}
                  minimumTrackTintColor={colors.secondary}
                  maximumTrackTintColor={GRAY}
                  thumbTintColor={colors.primary}
                  step={1}
                  onValueChange={(value: number) => {
                    setMinAgeText(value);
                  }}
                  onSlidingComplete={(value: number) => {
                    onValueLowerChanged(value);
                  }}
                />
              </View>
              <View>
                <View style={{ flexDirection: 'row' }}>
                  <Text>{titleUpper}: </Text>
                  <Text>{maxAgeText}</Text>
                </View>
                <Slider
                  value={upperValue}
                  minimumValue={lowerValue}
                  maximumValue={MAX_AGE}
                  minimumTrackTintColor={colors.secondary}
                  maximumTrackTintColor={GRAY}
                  thumbTintColor={colors.primary}
                  step={1}
                  onValueChange={(value: number) => {
                    setMaxAgeText(value);
                  }}
                  onSlidingComplete={(value: number) => {
                    onValueUpperChanged(value);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
      <Text style={{ paddingBottom: 4 }}>{title}</Text>
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default AgeRangeSliderModal;
