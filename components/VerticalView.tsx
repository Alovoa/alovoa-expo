import * as React from 'react';
import { RefreshControl, RefreshControlProps, ScrollView, ScrollViewProps } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';
import { useTheme } from 'react-native-paper';

type Props = Pick<ScrollViewProps, 'children' | 'style'> | Pick<RefreshControlProps, 'onRefresh'>
const VerticalView = React.forwardRef<ScrollView, Props>(({ children, style, onRefresh = undefined }: any, ref) => {
    const { colors } = useTheme();
    const [refreshing, setRefreshing] = React.useState(false);
    return (
            <ScrollView style={[{ display: 'flex', flex: 1, backgroundColor: colors.background}]} 
                contentContainerStyle={[{alignSelf: 'center', width: '100%', maxWidth: WIDESCREEN_HORIZONTAL_MAX, padding: 12}, style]} keyboardShouldPersistTaps='always' 
                ref={ref} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>{children}</ScrollView>
    );
});

export default VerticalView;