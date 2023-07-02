import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  Alert,
  Platform
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Text, useTheme } from "react-native-paper";
import styles, { DIMENSION_WIDTH, STATUS_BAR_HEIGHT } from "../../assets/styles";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { ScrollView } from "react-native-gesture-handler";
import { UserDto, UserImage, YourProfileResource } from "../../types";
import { FAB, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Photos = ({ route, navigation }) => {

  var user: UserDto = route.params.user;
  const { colors } = useTheme();
  const i18n = I18N.getI18n()
  const MAX_IMAGES = 4;
  const IMAGE_HEADER = "data:image/webp;base64,";
  const IMAGE_HEADER_JPEG = "data:image/jpeg;base64,";
  const IMG_SIZE_MAX = 600;

  const [profilePic, setProfilePic] = React.useState("");
  const [images, setImages] = React.useState(Array<UserImage>);
  const [changedProfilPic, setChangedProfilePic] = React.useState(false);

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    let dto: UserDto = data.user;
    setImages(dto.images);
    setProfilePic(dto.profilePicture);
  }

  React.useEffect(() => {
    navigation.setOptions({
      title: i18n.t('profile.photos.manage')
    });
    setProfilePic(user.profilePicture);
    setImages(user.images)
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
      if(Platform.OS == 'web') {
        format = ImageManipulator.SaveFormat.WEBP;
      }
      const saveOptions : ImageManipulator.SaveOptions = { compress: 0.8, format: format, base64: true }
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
      if(Platform.OS == 'ios') {
        b64 = IMAGE_HEADER_JPEG + imageData.base64;
      }
      await Global.Fetch(URL.USER_ADD_IMAGE, 'post', b64, 'text/plain');
      load();
    }
  }

  async function removeImage(id: number) {
    Alert.alert('', i18n.t('profile.photos.delete'), [
      {
        text: i18n.t('cancel'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: i18n.t('ok'),
        onPress: async () => {
          await Global.Fetch(Global.format(URL.USER_DELETE_IMAGE, String(id)), 'post');
          load();
        }
      }
    ]);
    
  }

  async function goBack() {
    navigation.navigate({
      name: 'YourProfile',
      params: { changed: changedProfilPic },
      merge: true,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.top, { zIndex: 10, position: 'absolute', width: DIMENSION_WIDTH, marginHorizontal: 0, padding: 8, paddingTop: STATUS_BAR_HEIGHT }]}>
        <Pressable onPress={goBack}><MaterialCommunityIcons name="arrow-left" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>
      </View>
      <TouchableOpacity
        onPress={() => { updateProfilePicture() }}>
        <Image source={{ uri: profilePic ? profilePic : undefined }} style={styles.photo} />
      </TouchableOpacity>
      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: -54, marginBottom: 24 }}>
        <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => updateProfilePicture()}>{i18n.t('profile.photos.change-profile-pic')}</Button>
      </View>
      <FlatList
        columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
        numColumns={2}
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => removeImage(item.id)}>
            <Image source={{ uri: item.content }} style={styles.profileImage} />
          </TouchableOpacity>
        )}
      />
      { images.length < MAX_IMAGES &&
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
    </View>

  )
};

export default Photos;
