import React from "react";
import {
  ScrollView,
  View,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Image,
  Alert
} from "react-native";
import { useTheme, Text, Button, Chip, Card, Menu } from "react-native-paper";
import { UserMiscInfoEnum, UserInterest, UnitsEnum, ProfileResource, UserDto, UserImage } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
  GRAY,
  DIMENSION_WIDTH,
  STATUS_BAR_HEIGHT
} from "../assets/styles";
import Icon from "../components/Icon";
import { SwiperFlatList } from 'react-native-swiper-flatlist';


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

  const [refreshing, setRefreshing] = React.useState(false);
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

  const [menuVisible, setMenuVisible] = React.useState(false);
  const showMenu = () => { setMenuVisible(true) };
  const hideMenu = () => { setMenuVisible(false) };

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
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
       detachPreviousScreen: false
    });
  }, [navigation]);

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
    setBlocked(true);
    hideMenu();
  }

  async function unblockUser() {
    await Global.Fetch(Global.format(URL.USER_UNBLOCK, user.idEncoded), 'post');
    setBlocked(false);
    hideMenu();
  }

  async function reportUser() {
    Alert.alert(i18n.t('profile.report.title'), i18n.t('profile.report.subtitle'), [
      {
        text: i18n.t('cancel'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: i18n.t('ok'),
        onPress: async () => {
          await Global.Fetch(Global.format(URL.USER_REPORT, user.idEncoded), 'post', ' ', 'text/plain');
          setReported(true);
          hideMenu();
        }
      }
    ]);

  }

  async function likeUser() {
    await Global.Fetch(Global.format(URL.USER_LIKE, user.idEncoded), 'post');
    setLiked(true);
  }

  async function hideUser() {
    await Global.Fetch(Global.format(URL.USER_HIDE, user.idEncoded), 'post');
    setHidden(true);
  }

  async function goBack() {
    navigation.goBack();
  }

  const imagesContainer = () => {
    return (
      images?.map((image, index) => (
        <Image source={{ uri: image.content ? image.content : undefined }} style={styles.photo} />
      ))
    );
  };

  return (
    <View>
      <View style={[styles.top, { zIndex: 10, position: 'absolute', width: DIMENSION_WIDTH, marginHorizontal: 0, padding: 8, paddingTop: STATUS_BAR_HEIGHT }]}>
        <Pressable onPress={goBack}><MaterialCommunityIcons name="arrow-left" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>
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

      <ScrollView style={styles.containerProfile} keyboardShouldPersistTaps='handled'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>

        <View>
          <SwiperFlatList
            autoplay
            autoplayDelay={5}
            paginationActiveColor={colors?.primary}
            paginationDefaultColor={colors?.secondary}
            paginationStyleItem={{ height: 6, width: 6 }}
            autoplayLoop={true}
            autoplayLoopKeepAnimation={true}
            showPagination={true}
          >
            {
              swiperImages?.map((image) => (
                <Image source={{ uri: image ? image : undefined }} style={styles.photo} />
              ))
            }
          </SwiperFlatList>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' }]}>
          <View><Text style={{ fontSize: 24 }}>{name + ", " + age}</Text>
            {lastActiveState <= 2 && <View style={{ flexDirection: 'row' }}><MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ padding: 4 }} />
              {lastActiveState == 1 &&
                <Text >{i18n.t('profile.active-state.1')}</Text>
              }
              {lastActiveState == 2 &&
                <Text >{i18n.t('profile.active-state.2')}</Text>
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
          <FlatList
            horizontal={true}
            data={interests}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Chip style={{ marginRight: 4, marginBottom: 4 }}><Text>{item.text}</Text></Chip>
            )}
          />
          <View style={{ marginTop: 16 }}>
            <View>
              <Card style={{ padding: 16 }}><Text style={{ fontSize: 18 }}>{description}</Text></Card>
            </View>


            <ScrollView horizontal={true} style={{ marginTop: 84 }}>
              <Chip icon="gender-male-female" style={styles.marginRight4}>
                <Text>{gender == Gender.MALE ? i18n.t('gender.male') :
                  gender == Gender.FEMALE ? i18n.t('gender.female') : i18n.t('gender.other')}</Text>
              </Chip>
              <Chip icon="drama-masks" style={styles.marginRight4}>
                <Text>{String(minAge) + " - " + String(maxAge)}</Text>
              </Chip>
              <Chip icon="magnify" style={styles.marginRight4}>
                <Text>{getGendersText()}</Text>
              </Chip>
              <Chip icon="magnify-plus-outline" style={styles.marginRight4}>
                <Text>{intention == Intention.MEET ? i18n.t('profile.intention.meet') :
                  intention == Intention.DATE ? i18n.t('profile.intention.date') : i18n.t('profile.intention.sex')}</Text>
              </Chip>
            </ScrollView>

            {(relationshipString || kidsString || drugsString) && <ScrollView horizontal={true} style={{ marginTop: 8, paddingBottom: 4 }}>
              {relationshipString &&
                <Chip icon="heart-multiple" style={styles.marginRight4}>
                  <Text>{relationshipString}</Text>
                </Chip>}
              {kidsString && <Chip icon="baby-carriage" style={styles.marginRight4}>
                <Text>{kidsString}</Text>
              </Chip>}
              {drugsString && <Chip icon="pill" style={styles.marginRight4}>
                <Text>{drugsString}</Text>
              </Chip>}
            </ScrollView>
            }
            <ScrollView horizontal={true} style={{ marginTop: 8, paddingBottom: 4 }}>
              <Chip icon="hand-coin" style={styles.marginRight4}>
                <Text>{String(donated) + ' €'}</Text>
              </Chip>
              <Chip icon="account-cancel" style={styles.marginRight4}>
                <Text>{'# ' + blocks}</Text>
              </Chip>
              <Chip icon="flag" style={styles.marginRight4}>
                <Text>{'# ' + reports}</Text>
              </Chip>
            </ScrollView>
            {
              <View style={{ marginTop: 48 }}></View>
            }
          </View>
        </View>
      </ScrollView>
      {!liked && <View style={{ marginBottom: 8, position: 'absolute', width: Dimensions.get('window').width, right: 0, bottom: 0, }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={[styles.button, { backgroundColor: GRAY }, hidden || !compatible ? { opacity: 0.5 } : {}]} onPress={() => hideUser()}
            disabled={hidden}>
            <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, !compatible ? { opacity: 0.5 } : {}]} onPress={() => likeUser()} disabled={!compatible}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
        </View>
      </View>}
    </View>
  );
};

export default Profile;
