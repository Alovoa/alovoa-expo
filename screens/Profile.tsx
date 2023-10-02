import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  useWindowDimensions,
} from "react-native";
import { useTheme, Text, Chip, Card, Menu } from "react-native-paper";
import { UserMiscInfoEnum, UserInterest, UnitsEnum, ProfileResource, UserDto, UserImage } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
  GRAY,
  STATUS_BAR_HEIGHT,
  WIDESCREEN_HORIZONTAL_MAX
} from "../assets/styles";
import Icon from "../components/Icon";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import Alert from "../components/Alert";
import VerticalView from "../components/VerticalView";


const i18n = I18N.getI18n()

enum Gender {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3
}

enum GenderText {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

enum Intention {
  MEET = 1,
  DATE = 2,
  SEX = 3
}

enum IntentionText {
  MEET = "meet",
  DATE = "date",
  SEX = "sex"
}

const Profile = ({ route, navigation }) => {

  const MIN_AGE = 16
  const MAX_AGE = 100

  var user: UserDto = route.params.user;
  var idEnc = route.params.idEnc;
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();

  const [compatible, setCompatible] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [you, setYou] = React.useState<UserDto>();
  const [profilePic, setProfilePic] = React.useState("");
  const [name, setName] = React.useState("");
  const [distance, setDistance] = React.useState(0);
  const [age, setAge] = React.useState(0);
  const [donated, setDonated] = React.useState(0);
  const [blocks, setBlocks] = React.useState(0);
  const [reports, setReports] = React.useState(0);
  const [minAge, setMinAge] = React.useState(MIN_AGE);
  const [maxAge, setMaxAge] = React.useState(MAX_AGE);
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [lastActiveState, setLastActiveState] = React.useState(Number.MAX_SAFE_INTEGER);
  const [blocked, setBlocked] = React.useState(false)
  const [reported, setReported] = React.useState(false)
  const [gender, setGender] = React.useState<Gender>()
  const [preferredGenders, setPreferredGenders] = React.useState(Array<Gender>);
  const [relationshipString, setRelationshipString] = React.useState<String>();
  const [kidsString, setKidsString] = React.useState<String>();
  const [drugsString, setDrugsString] = React.useState<String>();
  const [images, setImages] = React.useState(Array<UserImage>);
  const [swiperImages, setSwiperImages] = React.useState<Array<string>>();
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [previousScreen, setPreviousScreen] = React.useState<String | null>();
  const showMenu = () => { setMenuVisible(true) };
  const hideMenu = () => { setMenuVisible(false) };
  const maxWidth = width < WIDESCREEN_HORIZONTAL_MAX ? width : WIDESCREEN_HORIZONTAL_MAX;

  const style = StyleSheet.create({
    image: {
      width: maxWidth,
      height: 'auto',
      maxWidth: WIDESCREEN_HORIZONTAL_MAX,
      aspectRatio: 1,
    },
    title: {
      marginBottom: 4,
      opacity: 0.9,
      fontSize: 18
    }
  });

  const alertButtons = [
    {
      text: i18n.t('cancel'),
      onPress: () => { setAlertVisible(false); },
    },
    {
      text: i18n.t('ok'),
      onPress: async () => {
        await Global.Fetch(Global.format(URL.USER_REPORT, user.idEncoded), 'post', ' ', 'text/plain');
        setReported(true);
        setAlertVisible(false);
      }
    }
  ]

  function convertGenderText(text: string): Gender {
    switch (text) {
      case GenderText.MALE:
        return Gender.MALE;
      case GenderText.FEMALE:
        return Gender.FEMALE;
    }
    return Gender.OTHER;
  }

  async function load(fetch = false) {

    if (fetch || !user) {
      let response = await Global.Fetch(Global.format(URL.API_RESOURCE_PROFILE, user == null ? idEnc : user.idEncoded));
      let data: ProfileResource = response.data;
      user = data.user
      setYou(data.currUserDto);
    }

    setLiked(user.likedByCurrentUser);
    setHidden(user.hiddenByCurrentUser);
    setCompatible(user.compatible);
    setProfilePic(user.profilePicture);
    setDistance(user.distanceToUser);
    setName(user.firstName);
    setDonated(user.totalDonations);
    setAge(user.age);
    setBlocked(user.blockedByCurrentUser);
    setReported(user.reportedByCurrentUser);
    setBlocks(user.numBlockedByUsers);
    setReports(user.numReports);
    setMinAge(user.preferedMinAge);
    setMaxAge(user.preferedMaxAge);
    setDescription(user.description);
    setGender(convertGenderText(user.gender.text));
    setImages(user.images);
    if (user.lastActiveState) {
      setLastActiveState(user.lastActiveState);
    }
    let prefGenders: Array<Gender> = [];
    for (let i = 0; i < user.preferedGenders.length; i++) {
      prefGenders.push(convertGenderText(user.preferedGenders[i].text));
    }
    setPreferredGenders(prefGenders);
    setInterests(user.interests);
    var swiperImageData: Array<string> = [];
    swiperImageData.push(user.profilePicture);
    if (user.images) {
      user.images.forEach(function (image) {
        swiperImageData.push(image.content);
      });
    }
    setSwiperImages(swiperImageData);

    let intentionText = user.intention.text;
    switch (intentionText) {
      case IntentionText.MEET:
        setIntention(Intention.MEET);
        break;
      case IntentionText.DATE:
        setIntention(Intention.DATE);
        break;
      case IntentionText.SEX:
        setIntention(Intention.SEX);
        break;
    }

    let miscInfoData = user.miscInfos.map(item => item.value);

    let relationShip;
    if (miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_SINGLE)) {
      relationShip = i18n.t('profile.misc-info.relationship.single');
    }
    else if (miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_TAKEN)) {
      relationShip = i18n.t('profile.misc-info.relationship.taken');
    }
    else if (miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_OPEN)) {
      relationShip = i18n.t('profile.misc-info.relationship.open');
    }
    else if (miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_OTHER)) {
      relationShip = i18n.t('profile.misc-info.relationship.other');
    }
    setRelationshipString(relationShip);

    let kids;
    if (miscInfoData.includes(UserMiscInfoEnum.KIDS_NO)) {
      kids = i18n.t('profile.misc-info.kids.no');
    }
    else if (miscInfoData.includes(UserMiscInfoEnum.KIDS_YES)) {
      kids = i18n.t('profile.misc-info.kids.yes');
    }
    setKidsString(kids);

    let drugs: string[] = [];
    if (miscInfoData.includes(UserMiscInfoEnum.DRUGS_TOBACCO)) {
      drugs.push(i18n.t('profile.misc-info.drugs.tobacco'));
    }
    if (miscInfoData.includes(UserMiscInfoEnum.DRUGS_ALCOHOL)) {
      drugs.push(i18n.t('profile.misc-info.drugs.alcohol'));
    }
    if (miscInfoData.includes(UserMiscInfoEnum.DRUGS_CANNABIS)) {
      drugs.push(i18n.t('profile.misc-info.drugs.cannabis'));
    }
    if (miscInfoData.includes(UserMiscInfoEnum.DRUGS_OTHER)) {
      drugs.push(i18n.t('profile.misc-info.drugs.other'));
    }
    if (drugs.length > 0) {
      let s = drugs.join(', ');
      setDrugsString(s);
    }
  }

  React.useEffect(() => {
    const loadData = async () => {
      navigation.setOptions({ title: "" });
      if (user) {
        await load(false);
      }
      load(true);
    }
    loadData();
    loadPreviousScreen();
  }, []);

  async function loadPreviousScreen() {
    setPreviousScreen(await Global.GetStorage(Global.STORAGE_SCREEN));
  }

  function getGendersText() {
    let arr: string[] = [];
    preferredGenders.forEach(element => {
      switch (element) {
        case Gender.MALE:
          arr.push(i18n.t('gender.male'));
          break;
        case Gender.FEMALE:
          arr.push(i18n.t('gender.female'));
          break;
        case Gender.OTHER:
          arr.push(i18n.t('gender.other'));
          break;
      }
    });
    return arr.join(', ');
  }

  async function blockUser() {
    await Global.Fetch(Global.format(URL.USER_BLOCK, user.idEncoded), 'post');
    hideMenu();
    setBlocked(true);
  }

  async function unblockUser() {
    await Global.Fetch(Global.format(URL.USER_UNBLOCK, user.idEncoded), 'post');
    hideMenu();
    setBlocked(false);
  }

  async function reportUser() {
    hideMenu();
    setAlertVisible(true);
  }

  async function likeUser() {
    await Global.Fetch(Global.format(URL.USER_LIKE, user.idEncoded), 'post');
    setLiked(true);
    if (Global.SCREEN_SEARCH == previousScreen) {
      goBack();
    }
  }

  async function hideUser() {
    await Global.Fetch(Global.format(URL.USER_HIDE, user.idEncoded), 'post');
    setHidden(true);
    if (Global.SCREEN_SEARCH == previousScreen) {
      goBack();
    }
  }

  async function goBack() {
    navigation.navigate({
      name: 'Search',
      params: { changed: true },
      merge: true,
    });
  }

  React.useEffect(() => {
    navigation.addListener('beforeRemove', (e: any) => {
      if (Global.SCREEN_SEARCH == previousScreen) {
        e.preventDefault();
        goBack();
      }
    });
  }, [previousScreen]);

  return (
    <View style={{ height: height }}>
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <View style={{ zIndex: 1, marginBottom: 16, position: 'absolute', width: '100%', right: 0, bottom: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={[styles.button, { backgroundColor: GRAY, marginRight: 24 }, hidden || !compatible || liked ? { opacity: 0.5 } : {}]} onPress={() => hideUser()}
            disabled={hidden || liked}>
            <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, hidden || !compatible || liked ? { opacity: 0.5 } : {}, { backgroundColor: colors.primary }]} onPress={() => likeUser()} disabled={!compatible || liked}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.top, { zIndex: 1, position: "absolute", width: '100%', marginHorizontal: 0 }]}>
        <Pressable onPress={navigation.goBack}><MaterialCommunityIcons name="arrow-left" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Menu
              visible={menuVisible}
              onDismiss={hideMenu}
              anchor={<Pressable style={{ padding: 8 }} onPress={() => showMenu()}><MaterialCommunityIcons name="dots-vertical" size={24} color={colors?.onSurface} /></Pressable>}>
              {!blocked && <Menu.Item leadingIcon="block-helper" onPress={blockUser} title={i18n.t('profile.block')} />}
              {blocked && <Menu.Item leadingIcon="block-helper" onPress={unblockUser} title={i18n.t('profile.unblock')} />}
              {!reported && <Menu.Item leadingIcon="flag" onPress={reportUser} title={i18n.t('profile.report.title')} />}
            </Menu>
          </View>
        </View>
      </View>
      <VerticalView style={{ padding: 0 }} onRefresh={load}>
        <View>
          <SwiperFlatList
            autoplay
            autoplayDelay={5}
            paginationActiveColor={colors?.primary}
            paginationDefaultColor={colors?.secondary}
            paginationStyleItem={{ height: 8, width: 8, marginHorizontal: 20 }}
            autoplayLoop={true}
            autoplayLoopKeepAnimation={true}
            showPagination={swiperImages ? swiperImages?.length > 1 : false}
            getItemLayout={(data, index) => (
              { length: maxWidth, offset: maxWidth * index, index: index }
            )}
          >
            {
              swiperImages?.map((image, index) => (
                <Image key={index} source={{ uri: image ? image : undefined }} style={[style.image]} />
              ))
            }
          </SwiperFlatList>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 24, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between' }]}>
          <View><Text style={{ fontSize: 24 }}>{name + ", " + age}</Text>
            {lastActiveState <= 2 && <View style={{ flexDirection: 'row' }}><MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ padding: 4 }} />
              {lastActiveState == 1 &&
                <Text style={{ alignSelf: 'center' }}>{i18n.t('profile.active-state.1')}</Text>
              }
              {lastActiveState == 2 &&
                <Text style={{ alignSelf: 'center' }}>{i18n.t('profile.active-state.2')}</Text>
              }
            </View>}

          </View>
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: /*colors?.onSurface*/ colors?.secondary }]} />
            <Text>{distance}</Text>
            <Text>{you?.units == UnitsEnum.IMPERIAL ? ' mi' : ' km'}</Text>
          </View>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 0 }]}>

          <View style={{ marginTop: 0 }}>
            <Text style={style.title}>{i18n.t('profile.profile-page.interests')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {
                interests?.map((item, index) => (
                  <Chip key={index} style={[styles.marginRight4, styles.marginBottom4]}><Text>{item.text}</Text></Chip>
                ))
              }
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={style.title}>{i18n.t('profile.profile-page.description')}</Text>
            <View>
              <Card style={{ padding: 16 }}><Text style={{ fontSize: 18 }}>{description}</Text></Card>
            </View>

            <View style={{ paddingTop: 24 }}></View>
            <Text style={style.title}>{i18n.t('profile.profile-page.basics')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip icon="gender-male-female" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{gender == Gender.MALE ? i18n.t('gender.male') :
                  gender == Gender.FEMALE ? i18n.t('gender.female') : i18n.t('gender.other')}</Text>
              </Chip>
              <Chip icon="drama-masks" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{String(minAge) + " - " + String(maxAge)}</Text>
              </Chip>
              <Chip icon="magnify" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{getGendersText()}</Text>
              </Chip>
              <Chip icon="magnify-plus-outline" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{intention == Intention.MEET ? i18n.t('profile.intention.meet') :
                  intention == Intention.DATE ? i18n.t('profile.intention.date') : i18n.t('profile.intention.sex')}</Text>
              </Chip>
              {relationshipString &&
                <Chip icon="heart-multiple" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{relationshipString}</Text>
                </Chip>}
              {kidsString && <Chip icon="baby-carriage" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{kidsString}</Text>
              </Chip>}
              {drugsString && <Chip icon="pill" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{drugsString}</Text>
              </Chip>}
            </View>

            <View style={{ paddingTop: 16 }}></View>
            <Text style={style.title}>{i18n.t('profile.profile-page.additional')}</Text>
            <View style={{ paddingBottom: 4, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip icon="hand-coin" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{String(donated) + ' €'}</Text>
              </Chip>
              <Chip icon="account-cancel" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{'# ' + blocks}</Text>
              </Chip>
              <Chip icon="flag" style={[styles.marginRight4, styles.marginBottom4]}>
                <Text>{'# ' + reports}</Text>
              </Chip>
            </View>
            {
              <View style={{ marginTop: 80 }}></View>
            }
          </View>
        </View>
        <Alert visible={alertVisible} setVisible={setAlertVisible} message={i18n.t('profile.report.subtitle')} buttons={alertButtons} />
      </VerticalView>
    </View>
  );
};

export default Profile;
