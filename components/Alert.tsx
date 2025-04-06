import * as React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { AlertModel } from '../types';
import { useWindowDimensions } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';

const Alert = ({ visible = false, setVisible, message = "", buttons = [] }: AlertModel) => {
    const { width } = useWindowDimensions();
    function calcMarginModal() {
        return width < WIDESCREEN_HORIZONTAL_MAX + 24 ? 24 : width / 5 + 24;
    }
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ marginHorizontal: calcMarginModal() }}>
                <Dialog.Content>
                    <Text variant="bodyMedium">{message}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    {
                        buttons.map((item, index) => (
                            <Button key={index} onPress={item.onPress}>
                                <Text>{item.text}</Text>
                            </Button>
                        ))
                    }
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default Alert;