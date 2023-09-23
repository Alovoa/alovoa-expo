import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  Platform,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from "react-native-paper";
import styles, { STATUS_BAR_HEIGHT, WIDESCREEN_HORIZONTAL_MAX } from "../../assets/styles";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { UserDto, UserImage, YourProfileResource } from "../../types";
import { FAB, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Alert from "../../components/Alert";
import VerticalView from "../../components/VerticalView";

const Photos = ({ route, navigation }) => {

  var user: UserDto = route.params.user;

  const { height, width } = useWindowDimensions();
  const { colors } = useTheme();
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
        load();
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

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    let dto: UserDto = data.user;
    console.log(dto.images.length)
    setImages(dto.images);
    setProfilePic(dto.profilePicture);
  }

  React.useEffect(() => {
    load();
  }, []);

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      let format = ImageManipulator.SaveFormat.JPEG;
      if (Platform.OS == 'web') {
        format = ImageManipulator.SaveFormat.WEBP;
      }
      const saveOptions: ImageManipulator.SaveOptions = { compress: 0.8, format: format, base64: true }
      const resizedImageData = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: IMG_SIZE_MAX, height: IMG_SIZE_MAX } }],
        saveOptions
      );
      return resizedImageData;
    } else {
      return null;
    }
  };

  async function updateProfilePicture() {
    let imageData: ImageManipulator.ImageResult | null = await pickImage();
    if (imageData != null) {
      let b64 = IMAGE_HEADER + imageData.base64;
      await Global.Fetch(URL.USER_UPDATE_PROFILE_PICTURE, 'post', b64, 'text/plain');
      setProfilePic(b64);
      setChangedProfilePic(true);
      user.profilePicture = b64;
    }
  }

  async function addImage() {
    let imageData: ImageManipulator.ImageResult | null = await pickImage();
    if (imageData != null) {
      let b64 = IMAGE_HEADER + imageData.base64;
      if (Platform.OS == 'ios') {
        b64 = IMAGE_HEADER_JPEG + imageData.base64;
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

  React.useEffect(
    () =>
      navigation.addListener('beforeRemove', (e: any) => {
        e.preventDefault();
        goBack();
      }),
    [navigation]
  );

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
    <View style={{ height: height }}>
      <View style={[styles.top, { zIndex: 1, position: "absolute", width: '100%', marginHorizontal: 0, padding: 8, paddingTop: STATUS_BAR_HEIGHT }]}>
        <Pressable onPress={goBack}><MaterialCommunityIcons name="arrow-left" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>
      </View>
      <VerticalView style={{ padding: 0 }} onRefresh={load}>
        <TouchableOpacity
          onPress={() => { updateProfilePicture() }}>
          <Image source={{ uri: profilePic ? profilePic : undefined }} style={style.image} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: -54, marginBottom: 24 }}>
          <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => updateProfilePicture()}>{i18n.t('profile.photos.change-profile-pic')}</Button>
        </View>
        <View style={{ flexDirection: 'row', width: '100%' }}>
          {
            images.map((item, index) => (
              <TouchableOpacity key={index} style={[style.image, style.imageSmall, { flex: 1 }]} onPress={() => removeImage(item.id)}>
                <Image source={{ uri: item.content }} style={[style.image]} />
              </TouchableOpacity>
            ))
          }
        </View>
        {images.length < MAX_IMAGES &&
          <FAB
            icon="image-plus"
            style={{
              position: 'absolute',
              margin: 16,
              right: 0,
              bottom: 0,
            }}
            onPress={() => addImage()}
          />
        }
      </VerticalView>
      <Alert visible={alertVisible} setVisible={setAlertVisible} message={i18n.t('profile.photos.delete')} buttons={alertButtons} />
    </View>
  )
};

export default Photos;
