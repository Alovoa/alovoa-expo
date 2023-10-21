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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { WIDESCREEN_HORIZONTAL_MAX } from "../../assets/styles";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { UserDto, UserImage, YourProfileResource } from "../../types";
import { FAB, Button } from 'react-native-paper';
import Alert from "../../components/Alert";
import VerticalView from "../../components/VerticalView";
import { useHeaderHeight } from '@react-navigation/elements';

const Pictures = ({ route, navigation }) => {

  var user: UserDto = route.params.user;

  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const i18n = I18N.getI18n()
  const MAX_IMAGES = 4;
  const IMAGE_HEADER = "data:image/webp;base64,";
  const IMAGE_HEADER_JPEG = "data:image/jpeg;base64,";
  const IMG_SIZE_MAX = 600;

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
    console.log(user)
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

  async function pickImage(): Promise<string | null | undefined> {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      if (Platform.OS == 'android') {
        let format = ImageManipulator.SaveFormat.JPEG;
        const saveOptions: ImageManipulator.SaveOptions = { compress: 0.8, format: format, base64: true }
        const resizedImageData = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: IMG_SIZE_MAX, height: IMG_SIZE_MAX } }],
          saveOptions
        );
        return resizedImageData.base64;
      } else {
        return result.assets[0].base64;
      }
    } else {
      return null;
    }
  };

  async function updateProfilePicture() {
    let imageData: string | null | undefined = await pickImage();
    if (imageData) {
      let b64 = IMAGE_HEADER + imageData;
      await Global.Fetch(URL.USER_UPDATE_PROFILE_PICTURE, 'post', b64, 'text/plain');
      setProfilePic(b64);
      setChangedProfilePic(true);
      user.profilePicture = b64;
    }
  }

  async function addImage() {
    let imageData: string | null | undefined = await pickImage();
    if (imageData != null) {
      let b64 = IMAGE_HEADER + imageData;
      if (Platform.OS == 'ios' || Platform.OS == 'android') {
        b64 = IMAGE_HEADER_JPEG + imageData;
      }
      await Global.Fetch(URL.USER_ADD_IMAGE, 'post', b64, 'text/plain');
      load();
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
            <FAB
              icon="image-plus"
              onPress={() => addImage()}
            />
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
