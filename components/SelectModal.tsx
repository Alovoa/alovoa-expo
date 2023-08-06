import React from "react";
import { SelectModalT } from "../types";
import { Modal, Portal, Text, Button, Checkbox, useTheme, IconButton } from 'react-native-paper';
import { View } from "react-native";

const SelectModal = ({ multi = false, minItems = 0, title, data, selected, onValueChanged }: SelectModalT) => {

  const { colors } = useTheme();
  const [selectedIds, setSelectedIds] = React.useState(selected);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: 12, borderRadius: 8 };

  function updateButtonText() {
    let text = data.filter(item => selectedIds.includes(item.id)).map(item => item.title).join(", ");
    setButtonText(text);
  }

  React.useEffect(() => {
    updateButtonText();
  }, [selectedIds, data]);

  React.useEffect(() => {
    updateButtonText();
    setSelectedIds(selected);
  }, [selected]);

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
                  } else {
                    if (hasItem) {
                      setSelectedIds(Array());
                    } else {
                      setSelectedIds(Array(item.id));
                    }
                  }
                  onValueChanged(item.id, !hasItem);
                }}
              />
            ))}
          </View>
        </Modal>
      </Portal>
      <Text>{title}</Text>
      <Button icon="chevron-right" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default SelectModal;
