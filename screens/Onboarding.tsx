import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useTheme, Text, Button, TextInput, RadioButton, IconButton, Checkbox, HelperText, FAB } from "react-native-paper";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import * as ImagePicker from 'expo-image-picker';
import SvgProfilePic from "../assets/onboarding/profilepic.svg";
import SvgDescription from "../assets/onboarding/description.svg";
import SvgGenders from "../assets/onboarding/genders.svg";
import SvgIntention from "../assets/onboarding/intention.svg";
import SvgInterests from "../assets/onboarding/interests.svg";
import SvgMatch from "../assets/onboarding/match.svg";
import * as I18N from "../i18n";
import * as URL from "../URL";
import * as Global from "../Global";
import { IntentionEnum, UserInterest, UserInterestAutocomplete, UserOnboarding, UserOnboardingResource } from "../types";
import * as ImageManipulator from 'expo-image-manipulator';
import InterestView from "../components/InterestView";

const IMAGE_HEADER = "data:image/png;base64,";

const i18n = I18N.getI18n()

enum Interest {
  One,
  Two,
  Three,
}

const Onboarding = () => {

  const GENDER_MALE = 1;
  const GENDER_FEMALE = 2;
  const GENDER_OTHER = 3;

  const PAGE_PROFILE_PIC = 0;
  const PAGE_DESCRIPTION = 1;
  const PAGE_PREF_GENDER = 2;

  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();

  const [image, setImage] = React.useState("");
  const [imageB64, setImageB64] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isLegal, setIsLegal] = React.useState(false);
  const [isGenderMaleEnabled, setIsGenderMaleEnabled] = React.useState(false);
  const [isGenderFemaleEnabled, setIsGenderFemaleEnabled] = React.useState(false);
  const [isGenderOtherEnabled, setIsGenderOtherEnabled] = React.useState(false);
  const [intention, setIntention] = React.useState("1");
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const scrollRef = React.useRef<SwiperFlatList>(null);
  const svgHeight = 150;
  const svgWidth = 200;
  const maxDescriptionLength = 200;
  const IMG_SIZE_MAX = 600;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    child: { width, justifyContent: 'center' },
    text: { fontSize: width * 0.5, textAlign: 'center' },
    view: {
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center'
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      margin: 4,
      flexDirection: 'row',
    },
    svg: {
      marginTop: 24,
      marginBottom: 12,
    },
    profilePicButton: {
      width: 200,
      height: 200
    },
    title: {
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 12,
      fontSize: 18,
    },
    radioButton: {
      marginBottom: 12,
      marginTop: 12,
    },
    switchText: {
      marginBottom: 12,
      marginTop: 12,
    },
    warning: {
      textAlign: 'center',
      marginTop: 24,
      opacity: 0.5,
      fontSize: 10
    }
  });

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_USER_ONBOARDING);
    let data: UserOnboardingResource = response.data;
    setIsLegal(data.isLegal);
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
      setImage(resizedImageData.uri);
      setImageB64(IMAGE_HEADER + resizedImageData.base64);
    }
  };

  const toggleGenderMaleSwitch = () => setIsGenderMaleEnabled(previousState => !previousState);
  const toggleGenderFemaleSwitch = () => setIsGenderFemaleEnabled(previousState => !previousState);
  const toggleGenderOtherSwitch = () => setIsGenderOtherEnabled(previousState => !previousState);

  function moveFlatlistNext() {
    scrollRef?.current?.scrollToIndex({ index: scrollRef?.current?.getCurrentIndex() + 1, animated: true });
  }

  async function submit() {
    if (!imageB64) {
      scrollRef?.current?.scrollToIndex({ index: PAGE_PROFILE_PIC });
      return;
    } else if (!description) {
      scrollRef?.current?.scrollToIndex({ index: PAGE_DESCRIPTION });
      return;
    } else if (!isGenderMaleEnabled && !isGenderFemaleEnabled && !isGenderOtherEnabled) {
      scrollRef?.current?.scrollToIndex({ index: PAGE_PREF_GENDER });
      return;
    }

    let dto = {} as UserOnboarding;
    dto.profilePicture = imageB64;
    let genders = []
    if (isGenderMaleEnabled) {
      genders.push(GENDER_MALE);
    }
    if (isGenderFemaleEnabled) {
      genders.push(GENDER_FEMALE);
    }
    if (isGenderOtherEnabled) {
      genders.push(GENDER_OTHER);
    }
    dto.preferredGenders = genders;
    dto.description = description;
    dto.interests = interests.map(i => i.text);
    dto.intention = Number(intention);

    try {
      await Global.Fetch(URL.USER_ONBOARDING, 'post', dto);
      await Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_MAIN);
      Global.loadPage(Global.INDEX_MAIN);

    } catch (e) {
      Global.ShowToast(i18n.t('error.generic'));
    }
  }

  return (
    <View>
      <SwiperFlatList
        ref={scrollRef}
        showPagination={true}
        renderAll={true}
        paginationDefaultColor="#9e9e9e"
        paginationActiveColor={colors.primary}
        paginationStyleItem={{ maxHeight: 20, maxWidth: 20, height: width / 30, width: width / 30, marginHorizontal: width / 90 }}
      >
        <View style={[styles.view]}>
          <SvgProfilePic style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.onboarding.profile-picture')}</Text>

          {!image && <IconButton icon="plus" mode="contained-tonal" size={60} onPress={pickImage} style={[styles.profilePicButton]} />}
          {image && <TouchableOpacity onPress={pickImage} ><Image source={{ uri: image }} style={{ width: 200, height: 200 }} /></TouchableOpacity>}

          <Text style={styles.warning}>{i18n.t('profile.onboarding.profile-picture-subtitle')}</Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          style={[styles.view]}>
          <SvgDescription style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.onboarding.description')}</Text>
          <View style={{ height: 120 }}>
            <TextInput
              multiline
              mode="outlined"
              onChangeText={(text) => setDescription(text)}
              placeholder={i18n.t('profile.onboarding.description-placeholder')}
              maxLength={maxDescriptionLength}
              value={description}
              autoCorrect={false}
              style={{ maxWidth: width, width: 320 }}
            />
            <View>
              <HelperText type="info" style={{ textAlign: 'right' }} visible>
                {description.length} / {maxDescriptionLength}
              </HelperText>
            </View>
          </View>
        </KeyboardAvoidingView>
        <View style={[styles.view]}>
          <SvgGenders style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.gender')}</Text>
          <View>
            <View style={{ flexDirection: "row" }}>
              <Checkbox.Item onPress={toggleGenderMaleSwitch} position="leading"
                status={isGenderMaleEnabled ? 'checked' : 'unchecked'} label={i18n.t('gender.male')} />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Checkbox.Item onPress={toggleGenderFemaleSwitch} position="leading"
                status={isGenderFemaleEnabled ? 'checked' : 'unchecked'} label={i18n.t('gender.female')} />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Checkbox.Item onPress={toggleGenderOtherSwitch} position="leading"
                status={isGenderOtherEnabled ? 'checked' : 'unchecked'} label={i18n.t('gender.other')} />
            </View>
          </View>
        </View>
        <View style={[styles.view]}>
          <SvgIntention style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.intention.title')}</Text>
          <RadioButton.Group
            value={intention}
            onValueChange={(value: string) => setIntention(value)}>
            <RadioButton.Item label={i18n.t('profile.intention.meet')} value={String(IntentionEnum.MEET)} style={{ flexDirection: 'row-reverse' }} />
            <RadioButton.Item label={i18n.t('profile.intention.date')} value={String(IntentionEnum.DATE)} style={{ flexDirection: 'row-reverse' }} />
            <RadioButton.Item label={i18n.t('profile.intention.sex')} value={String(IntentionEnum.SEX)} disabled={!isLegal} style={{ flexDirection: 'row-reverse' }} />
          </RadioButton.Group>

          <Text style={styles.warning}>{i18n.t('profile.intention.warning')}</Text>
        </View>
        <View style={[styles.view]}>
          <SvgInterests style={styles.svg} height={svgHeight} width={svgWidth} />
          <InterestView data={interests} setInterestsExternal={setInterests}></InterestView>
          <Text style={styles.warning}>{i18n.t('optional')}</Text>
        </View>
        <View style={[styles.view]}>
          <SvgMatch style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.onboarding.match.title')}</Text>
          <Button mode="contained" icon="heart" style={[{ marginTop: 48 }]} onPress={submit}>
            <Text style={{ color: "white" }}>{i18n.t('profile.onboarding.submit')}</Text>
          </Button>
          <Text style={styles.warning}>{i18n.t('profile.onboarding.match.subtitle')}</Text>
        </View>
      </SwiperFlatList>
      <FAB
        icon="chevron-right"
        style={{
          position: 'absolute',
          margin: 32,
          right: 0,
          bottom: 0,
          borderRadius: 100,
          backgroundColor: colors.primary,
        }}
        onPress={moveFlatlistNext}
        visible={height >= 530}
      />
    </View>
  )
}

export default Onboarding;
