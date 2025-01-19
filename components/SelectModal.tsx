import React from "react";
import { SelectModalT } from "../types";
import { Modal, Portal, Text, Button, Checkbox, useTheme, IconButton } from 'react-native-paper';
import { View, useWindowDimensions } from "react-native";
import * as I18N from "../i18n";
import { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import * as Global from "../Global";

const SelectModal = ({ multi = false, disabled = false, minItems = 0, title, data, selected, onValueChanged }: SelectModalT) => {

  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  
  const [selectedIds, setSelectedIds] = React.useState(selected);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(disabled);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  function updateButtonText() {
    let text = [...data.entries()].filter(([key, value]) => 
      selectedIds.includes(value[0])).map(([key, value]) => value[1] != undefined ? i18n.t(value[1]) : '').join(", ");
    if(!text) {
      text = Global.EMPTY_STRING;
    }
    setButtonText(text);
  }

  React.useEffect(() => {
    updateButtonText();
  }, [selectedIds, data]);

  React.useEffect(() => {
    updateButtonText();
    setSelectedIds(selected);
  }, [selected]);

  React.useEffect(() => {
    setButtonDisabled(disabled);
  }, [disabled]);

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
            {[...data].map(([key, value], index) => (
              <Checkbox.Item label={value ? i18n.t(value) : ''} key={index}
                status={selectedIds.includes(key) ? 'checked' : 'unchecked'}
                onPress={() => {
                  let hasItem = selectedIds.includes(key);
                  if (multi) {
                    if (hasItem) {
                      let copy = selectedIds.filter(s => s !== key);
                      if (copy.length >= minItems) {
                        setSelectedIds(copy);
                      }
                    } else {
                      const copy = [...selectedIds];
                      copy.push(key)
                      setSelectedIds(copy);
                    }
                    onValueChanged(key, !hasItem);
                  } else {
                    setSelectedIds([key]);
                    onValueChanged(key, true);
                    hideModal();
                  }
                }}
              />
            ))}
          </View>
        </Modal>
      </Portal>
      <Text style={{ paddingBottom: 4 }}>{title}</Text>
      <Button disabled={buttonDisabled} icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default SelectModal;
