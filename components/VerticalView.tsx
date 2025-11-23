import * as React from 'react';
import { RefreshControl, RefreshControlProps, ScrollView, ScrollViewProps } from 'react-native';
import { WIDESCREEN_HORIZONTAL_MAX } from '../assets/styles';
import { useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type Props = Pick<ScrollViewProps, 'children' | 'style'> | Pick<RefreshControlProps, 'onRefresh'>
const VerticalView = React.forwardRef<ScrollView, Props>(({ children, style, onRefresh = undefined }: any, ref) => {
    const { colors } = useTheme();
    const [refreshing] = React.useState(false); // todo: setRefreshing
    return (
            <KeyboardAwareScrollView style={[{ display: 'flex', flex: 1, backgroundColor: colors.background}]}  enableOnAndroid={true}
                contentContainerStyle={[{alignSelf: 'center', width: '100%', maxWidth: WIDESCREEN_HORIZONTAL_MAX, padding: 12, justifyContent: 'flex-end'}, style]}
                keyboardShouldPersistTaps='handled' keyboardOpeningTime={0}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>{children}</KeyboardAwareScrollView>
    );
});
VerticalView.displayName = 'VerticalView';

export default VerticalView;