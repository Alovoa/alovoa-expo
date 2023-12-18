import React from "react";
import {
  View,
  Platform,
  useWindowDimensions,
  Image
} from "react-native";
import { Text, Button, Card, ActivityIndicator } from "react-native-paper";
import styles, { STATUS_BAR_HEIGHT, WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import { YourProfileResource, UserDto } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import VerticalView from "../components/VerticalView";

const userdataFileName = "userdata-alovoa.json"
const MIME_JSON = "application/json";

const i18n = I18N.getI18n()

const YourProfile = ({ route, navigation }) => {

  const { height, width } = useWindowDimensions();

  const [requestingDeletion, setRequestingDeletion] = React.useState(false);
  const [data, setData] = React.useState<YourProfileResource>();
  const [user, setUser] = React.useState<UserDto>();
  const [profilePic, setProfilePic] = React.useState<string>();
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(0);
  const [idEnc, setIdEnc] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (route.params) {
      setProfilePic(user?.profilePicture);
      route.params.changed = false;
    }
  }, [navigation, route]);

  async function load() {
    setLoading(true);
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    setData(data);
    setUser(data.user)
    setIdEnc(data.user.idEncoded);
    setProfilePic(data.user.profilePicture);
    setName(data.user.firstName);
    setLoading(false);
  }
  React.useEffect(() => {
    load();
  }, []);

  async function logout() {
    Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_LOGIN);
    Global.navigate("Login");
  }

  async function downloadUserData() {
    const response = await Global.Fetch(Global.format(URL.USER_USERDATA, idEnc));
    const userData = JSON.stringify(response.data);

    if (Platform.OS == 'android') {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = permissions.directoryUri;
        let newFile = await StorageAccessFramework.createFileAsync(uri, userdataFileName, MIME_JSON);
        await StorageAccessFramework.writeAsStringAsync(newFile, userData);
        Global.ShowToast(i18n.t('profile.download-userdata-success'));
      }
    } else {
      let fileName = FileSystem.documentDirectory + '/alovoa.json';
      await FileSystem.writeAsStringAsync(fileName, userData, { encoding: FileSystem.EncodingType.UTF8 });
      Global.ShowToast(i18n.t('profile.download-userdata-success'));
      if (await Sharing.isAvailableAsync()) {
        Sharing.shareAsync(fileName);
      }
    }
  }

  async function deleteAccount() {
    if (!requestingDeletion) {
      setRequestingDeletion(true);
      await Global.Fetch(URL.USER_DELETE_ACCOUNT, 'post');
      Global.ShowToast(i18n.t('profile.delete-account-success'));
      setRequestingDeletion(false);
    }
  }

  return (
    <View style={{ height: height }}>
      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
        <View style={{ paddingTop: 32 }}></View>
        <Image source={{ uri: profilePic }} style={{ width: '50%', maxWidth: 500, borderRadius: 500, height: 'auto', aspectRatio: 1, alignSelf: 'center' }}></Image>

        <View style={[styles.containerProfileItem, { marginTop: 12, minHeight: height }]}>
          <Text style={[styles.name]}>{name + ", " + age}</Text>
          <View style={{ marginBottom: 48, marginTop: 12 }}>
            <Card mode="contained" style={{ padding: 12 }}>
              <Text style={{ textAlign: 'center' }}>{i18n.t('profile.donated') + ": " + String(user?.totalDonations) + ' €'}</Text>
            </Card>
          </View>

          <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
            style={{ alignSelf: 'stretch', marginBottom: 8 }} onPress={() => Global.navigate(Global.SCREEN_PROFILE_PICTURES, false, { user: user })}>{i18n.t('profile.screen.pictures')}</Button>
          <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
            style={{ alignSelf: 'stretch', marginBottom: 8 }} onPress={() => Global.navigate(Global.SCREEN_PROFILE_PROFILESETTINGS, false, { user: user })}>{i18n.t('profile.screen.profile')}</Button>
          <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
            style={{ alignSelf: 'stretch', marginBottom: 8 }} onPress={() => Global.navigate(Global.SCREEN_PROFILE_SEARCHSETTINGS, false, { data: data })}>{i18n.t('profile.screen.search')}</Button>
          <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
            style={{ alignSelf: 'stretch', marginBottom: 8 }} onPress={() => Global.navigate(Global.SCREEN_PROFILE_SETTINGS)}>{i18n.t('profile.screen.settings')}</Button>

        </View>
        <View style={[styles.containerProfileItem, { marginTop: 32, marginBottom: 24 }]}>
          <View style={{ marginTop: 128, paddingBottom: STATUS_BAR_HEIGHT + 24 }}>
            <Button mode='contained' onPress={() => logout()}>
              <Text>{i18n.t('profile.logout')}</Text>
            </Button>
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.link, { padding: 8 }]} onPress={() => {
                WebBrowser.openBrowserAsync(URL.PRIVACY);
              }}>{i18n.t('privacy-policy')}</Text>
              <Text style={[styles.link, { padding: 8 }]} onPress={() => {
                WebBrowser.openBrowserAsync(URL.TOS);
              }}>{i18n.t('tos')}</Text>
              <Text style={[styles.link, { padding: 8 }]} onPress={() => {
                WebBrowser.openBrowserAsync(URL.IMPRINT);
              }}>{i18n.t('imprint')}</Text>
              <Text style={[styles.link, { padding: 8 }]} onPress={() => {
                downloadUserData();
              }}>{i18n.t('profile.download-userdata')}</Text>
              <Text style={[styles.link, { padding: 8, opacity: requestingDeletion ? 0.3 : 1 }]} onPress={() => {
                deleteAccount();
              }}>{i18n.t('profile.delete-account')}</Text>
            </View>
          </View>

        </View>
      </VerticalView>
    </View>
  );
};

export default YourProfile;
