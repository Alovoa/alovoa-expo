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
  const defaultTimeoutString = String(Global.DEFAULT_GPS_TIMEOUT);

  React.useEffect(() => {
    load();
  }, []);

  const [latitude, setLatitude] = React.useState("0.00");
  const [longitude, setLongitude] = React.useState("0.00");
  const [gpsTimeout, setGpsTimeout] = React.useState(defaultTimeoutString);
  

  async function load() { 
    setLatitude(String(user.locationLatitude));
    setLongitude(String(user.locationLongitude));
    let timeoutStorage = await Global.GetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT);
    setGpsTimeout(timeoutStorage ? timeoutStorage : defaultTimeoutString);
  }

  async function uploadLocation() {
    if(!isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      Global.Fetch(Global.format(URL.USER_UPDATE_LOCATION, latitude, longitude), 'post');
    }
  }

  async function saveGpsTimeout(value?: number) {
    if(value) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT, String(value));
    } else if(!isNaN(Number(gpsTimeout))) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT, gpsTimeout);
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
        <View style={[styles.containerProfileItem, { marginTop: 32, flexDirection: 'row', gap: 4, alignItems: 'center' }]}>
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.min-gps-timeout')}
              value={gpsTimeout}
              onChangeText={setGpsTimeout}
              onSubmitEditing={() => saveGpsTimeout}
              keyboardType="decimal-pad"
            />
            <IconButton
              icon="check"
              size={20}
              mode="contained"
              onPress={() => saveGpsTimeout}
            />
            <IconButton
              icon="undo-variant"
              size={20}
              mode="contained"
              onPress={() => {
                setGpsTimeout(defaultTimeoutString);
                saveGpsTimeout(Global.DEFAULT_GPS_TIMEOUT)
              }}
            />
        </View>
      </VerticalView>
    </View>
  );
};

export default AdvancedSettings;
