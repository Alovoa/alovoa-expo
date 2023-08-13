import React from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useTheme, Text, Button, TextInput, Switch, RadioButton, IconButton, Checkbox } from "react-native-paper";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import * as ImagePicker from 'expo-image-picker';
import SvgProfilePic from "../assets/onboarding/profilepic.svg";
import SvgDescription from "../assets/onboarding/description.svg";
import SvgGenders from "../assets/onboarding/genders.svg";
import SvgIntention from "../assets/onboarding/intention.svg";
import SvgInterests from "../assets/onboarding/interests.svg";
import SvgMatch from "../assets/onboarding/match.svg";
import { FontAwesome } from '@expo/vector-icons';
import * as I18N from "../i18n";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import * as URL from "../URL";
import * as Global from "../Global";
import { IntentionEnum, UserInterestAutocomplete, UserOnboarding, UserOnboardingResource } from "../types";
import * as ImageManipulator from 'expo-image-manipulator';
import { TouchableOpacity } from "react-native-gesture-handler";

const IMAGE_HEADER = "data:image/png;base64,";

const i18n = I18N.getI18n()

enum Interest {
  One,
  Two,
  Three,
}

const GENDER_MALE = 1
const GENDER_FEMALE = 2
const GENDER_OTHER = 3

const Onboarding = () => {

  const { colors } = useTheme();

  const [image, setImage] = React.useState("");
  const [imageB64, setImageB64] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isLegal, setIsLegal] = React.useState(false);
  const [isGenderMaleEnabled, setIsGenderMaleEnabled] = React.useState(false);
  const [isGenderFemaleEnabled, setIsGenderFemaleEnabled] = React.useState(false);
  const [isGenderOtherEnabled, setIsGenderOtherEnabled] = React.useState(false);
  const [intention, setIntention] = React.useState("1");
  const [interest1, setInterest1] = React.useState("");
  const [interest2, setInterest2] = React.useState("");
  const [interest3, setInterest3] = React.useState("");
  const [loading, setLoading] = React.useState(false)
  const [loading2, setLoading2] = React.useState(false)
  const [loading3, setLoading3] = React.useState(false)
  const [suggestionsList, setSuggestionsList] = React.useState(Array<any>)
  const [suggestionsList2, setSuggestionsList2] = React.useState(Array<any>)
  const [suggestionsList3, setSuggestionsList3] = React.useState(Array<any>)
  const dropdownController = React.useRef({})
  const dropdownController2 = React.useRef({})
  const dropdownController3 = React.useRef({})
  const scrollRef = React.useRef(null);
  const svgHeight = 150;
  const svgWidth = 200;
  const IMG_SIZE_MAX = 600;

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

  function cleanInterest(txt: string) {
    let txtCopy = txt
    txtCopy = txtCopy.replace(/ /g, "-");
    let text = txtCopy.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    return text;
  }

  const getSuggestions = React.useCallback(async (i: Interest, q: string) => {
    const filterToken = cleanInterest(q)

    switch (i) {
      case Interest.One:
        dropdownController.current.setInputText(filterToken);
        setInterest1(filterToken);
        break;
      case Interest.Two:
        dropdownController2.current.setInputText(filterToken);
        setInterest2(filterToken);
        break;
      case Interest.Three:
        dropdownController3.current.setInputText(filterToken);
        setInterest3(filterToken);
        break;
    }

    if (typeof q !== 'string' || q.length < 2) {
      switch (i) {
        case Interest.One:
          setSuggestionsList([])
          break;
        case Interest.Two:
          setSuggestionsList2([])
          break;
        case Interest.Three:
          setSuggestionsList3([])
          break;
      }
      return
    }
    switch (i) {
      case Interest.One:
        setLoading(true)
        break;
      case Interest.Two:
        setLoading2(true)
        break;
      case Interest.Three:
        setLoading3(true)
        break;
    }
    const response = await Global.Fetch(Global.format(URL.USER_INTEREST_AUTOCOMPLETE, encodeURI(filterToken)));
    const items: Array<UserInterestAutocomplete> = response.data
    const suggestions = items
      .map((item: any) => ({
        id: item.name,
        title: item.name + " (" + item.countString + ")",
      }))
    switch (i) {
      case Interest.One:
        setSuggestionsList(suggestions)
        setLoading(false)
        break;
      case Interest.Two:
        setSuggestionsList2(suggestions)
        setLoading2(false)
        break;
      case Interest.Three:
        setSuggestionsList3(suggestions)
        setLoading3(false)
        break;
    }
  }, [])

  const onClearPress = React.useCallback(() => { setSuggestionsList([]) }, [])
  const onClearPress2 = React.useCallback(() => { setSuggestionsList2([]) }, [])
  const onClearPress3 = React.useCallback(() => { setSuggestionsList3([]) }, [])

  async function submit() {
    if (!imageB64) {
      scrollRef.current.scrollToIndex({ index: 0 });
      return;
    } else if (!description) {
      scrollRef.current.scrollToIndex({ index: 1 });
      return;
    } else if (!isGenderMaleEnabled && !isGenderFemaleEnabled && !isGenderOtherEnabled) {
      scrollRef.current.scrollToIndex({ index: 2 });
      return;
    }

    let dto = {} as UserOnboarding;
    dto.profilePicture = imageB64
    let genders = []
    if (isGenderMaleEnabled) {
      genders.push(GENDER_MALE)
    }
    if (isGenderFemaleEnabled) {
      genders.push(GENDER_FEMALE)
    }
    if (isGenderOtherEnabled) {
      genders.push(GENDER_OTHER)
    }
    dto.preferredGenders = genders
    dto.description = description

    let interests = []
    if (interest1) {
      interests.push(interest1)
    }
    if (interest2) {
      interests.push(interest2)
    }
    if (interest3) {
      interests.push(interest3)
    }
    dto.interests = interests
    dto.intention = Number(intention)

    try {
      await Global.Fetch(URL.USER_ONBOARDING, 'post', dto);
      await Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_MAIN);
      Global.loadPage(Global.INDEX_MAIN);

    } catch (e) { }
  }

  return (
    <View style={{ backgroundColor: colors.background }}>
      <SwiperFlatList
        ref={scrollRef}
        showPagination={true}
        renderAll={true}
        paginationDefaultColor="#9e9e9e"
        paginationActiveColor="#EC407A"
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
          <View style={{ height: 120, width: 300 }}>
            <TextInput
              multiline
              mode="outlined"
              onChangeText={(text) => setDescription(text)}
              placeholder={i18n.t('profile.onboarding.description-placeholder')}
              maxLength={200}
              value={description}
              autoCorrect={false}
            />
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          style={[styles.view]}>
          <SvgInterests style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.onboarding.interests')}</Text>
          <View style={{ height: 180 }}>
            <AutocompleteDropdown
              EmptyResultComponent={<></>}
              controller={controller => {
                dropdownController.current = controller
              }}
              direction={Platform.select({ ios: 'down' })}
              dataSet={suggestionsList}
              onChangeText={text => getSuggestions(Interest.One, text)}
              onSelectItem={item => {
                item && setInterest1(item.id)
              }}
              debounce={500}
              suggestionsListMaxHeight={200}
              onClear={onClearPress}
              loading={loading}
              useFilter={false}
              textInputProps={{
                backgroundColor: '#FDE7F4',
                placeholder: 'starwars',
                autoCorrect: false,
                autoCapitalize: 'none',
                style: {
                  borderRadius: 25,
                  paddingLeft: 18,
                },
              }}
              rightButtonsContainerStyle={{
                right: 8,
                height: 30,
                backgroundColor: '#FDE7F4',
                alignSelf: 'center',
              }}
              inputContainerStyle={{
                backgroundColor: '#FDE7F4',
                borderRadius: 25,
              }}
              suggestionsListContainerStyle={{
              }}
              containerStyle={{ flexGrow: 1, flexShrink: 1 }}
              renderItem={(item, text) => <Text style={{ padding: 15, backgroundColor: colors.background }}>{item.title}</Text>}
              ChevronIconComponent={<FontAwesome name="chevron-down" size={20} />}
              ClearIconComponent={<FontAwesome name="times-circle" size={18} />}
              inputHeight={50}
              showChevron={false}
              closeOnBlur={false}
            />
            <AutocompleteDropdown
              EmptyResultComponent={<></>}
              controller={controller => {
                dropdownController2.current = controller
              }}
              direction={Platform.select({ ios: 'down' })}
              dataSet={suggestionsList2}
              onChangeText={text => getSuggestions(Interest.Two, text)}
              onSelectItem={item => {
                item && setInterest2(item.id)
              }}
              debounce={500}
              suggestionsListMaxHeight={200}
              onClear={onClearPress2}
              loading={loading2}
              useFilter={false}
              textInputProps={{
                backgroundColor: '#FDE7F4',
                placeholder: 'taichi',
                autoCorrect: false,
                autoCapitalize: 'none',
                style: {
                  borderRadius: 25,
                  paddingLeft: 18,
                },
              }}
              rightButtonsContainerStyle={{
                right: 8,
                height: 30,
                backgroundColor: '#FDE7F4',
                alignSelf: 'center',
              }}
              inputContainerStyle={{
                backgroundColor: '#FDE7F4',
                borderRadius: 25,
              }}
              suggestionsListContainerStyle={{
              }}
              containerStyle={{ flexGrow: 1, flexShrink: 1 }}
              renderItem={(item, text) => <Text style={{ padding: 15, backgroundColor: colors.background }}>{item.title}</Text>}
              ChevronIconComponent={<FontAwesome name="chevron-down" size={20} />}
              ClearIconComponent={<FontAwesome name="times-circle" size={18} />}
              inputHeight={50}
              showChevron={false}
              closeOnBlur={false}
            />
            <AutocompleteDropdown
              EmptyResultComponent={<></>}
              controller={controller => {
                dropdownController3.current = controller
              }}
              // initialValue={'1'}
              direction={Platform.select({ ios: 'down' })}
              dataSet={suggestionsList3}
              onChangeText={text => getSuggestions(Interest.Three, text)}
              onSelectItem={item => {
                item && setInterest3(item.id)
              }}
              debounce={500}
              suggestionsListMaxHeight={200}
              onClear={onClearPress3}
              loading={loading3}
              useFilter={false}
              textInputProps={{
                backgroundColor: '#FDE7F4',
                placeholder: 'anime',
                autoCorrect: false,
                autoCapitalize: 'none',
                style: {
                  borderRadius: 25,
                  paddingLeft: 18,
                },
              }}
              rightButtonsContainerStyle={{
                right: 8,
                height: 30,
                backgroundColor: '#FDE7F4',
                alignSelf: 'center',
              }}
              inputContainerStyle={{
                borderRadius: 25,
                backgroundColor: '#FDE7F4',
              }}
              suggestionsListContainerStyle={{
              }}
              containerStyle={{ flexGrow: 1, flexShrink: 1 }}
              renderItem={(item, text) => <Text style={{ padding: 15, backgroundColor: colors.background }}>{item.title}</Text>}
              ChevronIconComponent={<FontAwesome name="chevron-down" size={20} />}
              ClearIconComponent={<FontAwesome name="times-circle" size={18} />}
              inputHeight={50}
              showChevron={false}
              closeOnBlur={false}
            />
          </View>
          <Text style={styles.warning}>{i18n.t('optional')}</Text>
        </KeyboardAvoidingView>
        <View style={[styles.view]}>
          <SvgMatch style={styles.svg} height={svgHeight} width={svgWidth} />
          <Text style={styles.title}>{i18n.t('profile.onboarding.match.title')}</Text>
          <Button mode="contained" icon="heart" style={[{ marginTop: 48 }]} onPress={submit}>
            <Text style={{ color: "white" }}>{i18n.t('profile.onboarding.submit')}</Text>
          </Button>
          <Text style={styles.warning}>{i18n.t('profile.onboarding.match.subtitle')}</Text>
        </View>
      </SwiperFlatList>
    </View>
  )
}

const { height, width } = Dimensions.get('window');

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
    backgroundColor: '#ec407a',
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

export default Onboarding;
