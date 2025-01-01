import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import styles from "../../assets/styles";
import { UserDto, YourProfileResource } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import VerticalView from "../../components/VerticalView";
import { IconButton, TextInput, useTheme } from "react-native-paper";


const i18n = I18N.getI18n();

const AdvancedSettings = ({ route, navigation }) => {

  var user: UserDto = route.params.user;
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();

  React.useEffect(() => {
    load();
  }, []);

  const [latitude, setLatitude] = React.useState("0.00");
  const [longitude, setLongitude] = React.useState("0.00");
  

  async function load() { 
    setLatitude(String(user.locationLatitude));
    setLongitude(String(user.locationLongitude));
  }

  async function uploadLocation() {
    if(!isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      Global.Fetch(Global.format(URL.USER_UPDATE_LOCATION, latitude, longitude), 'post');
    }
  }

  return (
    <View style={{ height: height, width: '100%' }}>
      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <View style={[styles.containerProfileItem, { marginTop: 32, flexDirection: 'row', gap: 4, alignItems: 'center' }]}>
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.location.latitude')}
              value={latitude}
              onChangeText={setLatitude}
              onSubmitEditing={uploadLocation}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.location.longitude')}
              value={longitude}
              onChangeText={setLongitude}
              onSubmitEditing={uploadLocation}
              keyboardType="decimal-pad"
            />
            <IconButton
              icon="upload"
              size={20}
              mode="contained"
              onPress={uploadLocation}
            />
        </View>
      </VerticalView>
    </View>
  );
};

export default AdvancedSettings;
