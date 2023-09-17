import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';
import { useTheme } from 'react-native-paper';

const VerticalView = ({ children, style, ref, onRefresh = undefined }: any) => {
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);
    return (
        <View style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row' }}>
            <ScrollView style={[{ flex: 1, maxWidth: WIDESCREEN_HORIZONTAL_MAX, width: '100%', padding: 12, backgroundColor: colors.background }, style]}
                keyboardShouldPersistTaps='always' ref={ref} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>{children}</ScrollView>
        </View>
    );
};

export default VerticalView;