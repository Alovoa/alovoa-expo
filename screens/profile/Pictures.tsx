import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions,
  FlatList
} from "react-native";
import { Buffer } from "buffer";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { WIDESCREEN_HORIZONTAL_MAX } from "../../assets/styles";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { UserDto, UserImage, YourProfileResource } from "../../types";
import { Button } from 'react-native-paper';
import Alert from "../../components/Alert";
import VerticalView from "../../components/VerticalView";
import { useHeaderHeight } from '@react-navigation/elements';

const Pictures = ({ route, navigation }) => {

  var user: UserDto = route.params.user;

  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const i18n = I18N.getI18n()
  const MAX_IMAGES = 4;

  const [alertVisible, setAlertVisible] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState("");
  const [images, setImages] = React.useState(Array<UserImage>);
  const [changedProfilePic, setChangedProfilePic] = React.useState(false);
  const [imageIdToBeRemoved, setImageIdToBeRemoved] = React.useState(0);

  const alertButtons = [
    {
      text: i18n.t('cancel'),
      onPress: () => {
        setAlertVisible(false);
        setImageIdToBeRemoved(0);
      }
    },
    {
      text: i18n.t('ok'),
      onPress: async () => {
        await Global.Fetch(Global.format(URL.USER_DELETE_IMAGE, String(imageIdToBeRemoved)), 'post');
        let imagesCopy = [...images];
        let newImages = imagesCopy.filter(item => item.id !== imageIdToBeRemoved);
        setImages(newImages);
        setImageIdToBeRemoved(0);
        setAlertVisible(false);
        user.images = newImages;
      }
    }
  ]

  React.useEffect(() => {
    if (imageIdToBeRemoved) {
      setAlertVisible(true);
    }
  }, [imageIdToBeRemoved]);

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e: any) => {
        e.preventDefault();
        goBack();
      }),
    [navigation]
  );

  React.useEffect(() => {
    setImages(user.images);
    setProfilePic(user.profilePicture);
  }, []);

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    let dto: UserDto = data.user;
    setImages(dto.images);
    setProfilePic(dto.profilePicture);
  }

  async function updateProfilePicture() {
    let imageData: string | null | undefined = await Global.pickImage();
    if (imageData) {
      const buffer = Buffer.from(imageData, "base64");
      const blob = new Blob([buffer]);
      var bodyFormData = new FormData();
      bodyFormData.append('file', blob);
      bodyFormData.append('mime', ImageManipulator.SaveFormat.JPEG);
      console.log(bodyFormData)
      await Global.Fetch(URL.USER_UPDATE_PROFILE_PICTURE, 'post', bodyFormData, 'multipart/form-data');
      setProfilePic(profilePic + '?' + new Date());
      setChangedProfilePic(true);
      route.params.changed = true;
    }
  }

  async function addImage() {
    let imageData: string | null | undefined = await Global.pickImage();
    if (imageData != null) {
      const buffer = Buffer.from(imageData, "base64");
      const blob = new Blob([buffer]);
      var bodyFormData = new FormData();
      bodyFormData.append('file', blob);
      bodyFormData.append('mime', ImageManipulator.SaveFormat.JPEG);
      const response = await Global.Fetch(URL.USER_ADD_IMAGE, 'post', bodyFormData, 'multipart/form-data');
      const responseImages: Array<UserImage> = response.data;
      console.log(images)
      console.log(responseImages)
      setImages(responseImages);
      user.images = responseImages;
    }
  }

  async function removeImage(id: number) {
    setImageIdToBeRemoved(id);
  }

  async function goBack() {
    navigation.navigate({
      name: 'YourProfile',
      params: { changed: changedProfilePic },
      merge: true,
    });
  }

  const style = StyleSheet.create({
    image: {
      width: '100%',
      height: 'auto',
      maxWidth: WIDESCREEN_HORIZONTAL_MAX,
      aspectRatio: 1,
    },
    imageSmall: {
      width: '50%',
      maxWidth: '50%',
    }
  });

  return (
    <View style={{ height: height - headerHeight }}>
      <View style={{
        zIndex: 1, position: 'absolute', marginBottom: 16,
        marginRight: 16, width: '100%', right: 0, bottom: 0
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          {images.length < MAX_IMAGES &&
            <Button icon="image-plus" mode="elevated" onPress={() => addImage()}>
              {i18n.t('profile.photos.add')}
            </Button>
          }
        </View>
      </View>
      <VerticalView onRefresh={load}>
        <TouchableOpacity
          onPress={() => { updateProfilePicture() }}>
          <Image source={{ uri: profilePic ? profilePic : undefined }} style={[style.image, { width: '70%', alignSelf: 'center', borderRadius: 12 }]} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: -54, marginBottom: 24 }}>
          <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => updateProfilePicture()}>{i18n.t('profile.photos.change-profile-pic')}</Button>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <FlatList
            style={{ marginBottom: 4 }}
            numColumns={2}
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={[style.image, style.imageSmall, { padding: 12 }]} onPress={() => removeImage(item.id)}>
                <Image source={{ uri: item.content }} style={[style.image, { borderRadius: 8 }]} />
              </TouchableOpacity>
            )}
          />
        </View>
        <Alert visible={alertVisible} setVisible={setAlertVisible} message={i18n.t('profile.photos.delete')} buttons={alertButtons} />
      </VerticalView>
    </View>
  )
};

export default Pictures;
