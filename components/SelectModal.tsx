import React from "react";
import { SelectModalT } from "../types";
import { Modal, Portal, Text, Button, Checkbox, useTheme, IconButton } from 'react-native-paper';
import { View } from "react-native";
import * as I18N from "../i18n";

const SelectModal = ({ multi = false, disabled = false, minItems = 0, title, data, selected, onValueChanged }: SelectModalT) => {

  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const [selectedIds, setSelectedIds] = React.useState(selected);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [buttonDisabled, setButtonDisabled] = React.useState(disabled);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: 12, borderRadius: 8 };

  function updateButtonText() {
    let text = data.filter(item => selectedIds.includes(item.id)).map(item => item.title).join(", ");
    if(!text) {
      text = i18n.t('profile.misc-info.none');
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
            {data.map((item, index) => (
              <Checkbox.Item label={item.title} key={index}
                status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
                onPress={() => {
                  let hasItem = selectedIds.includes(item.id);
                  if (multi) {
                    if (hasItem) {
                      let copy = selectedIds.filter(s => s !== item.id);
                      if (copy.length >= minItems) {
                        setSelectedIds(copy);
                      }
                    } else {
                      const copy = [...selectedIds];
                      copy.push(item.id)
                      setSelectedIds(copy);
                    }
                    onValueChanged(item.id, !hasItem);
                  } else {
                    setSelectedIds([item.id]);
                    onValueChanged(item.id, true);
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
