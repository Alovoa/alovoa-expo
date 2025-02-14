import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ScrollView,
  Platform,
} from "react-native";
import { useTheme, Text, Chip, Card, Menu, Surface, Portal, Modal, IconButton, RadioButton, Button, Tooltip, MaterialBottomTabScreenProps } from "react-native-paper";
import { UserInterest, UnitsEnum, ProfileResource, UserDto, UserPrompt, GenderNameMap, Gender, IntentionNameMap, UserMiscInfo, MiscInfoRelationshipNameMap, MiscInfoKidsNameMap, MiscInfoDrugsOtherNameMap, MiscInfoDrugsAlcoholNameMap, MiscInfoDrugsTobaccoNameMap, MiscInfoDrugsCannabisNameMap, MiscInfoRelationshipTypeNameMap, MiscInfoFamilyNameMap, MiscInfoPoliticsNameMap, MiscInfoReligionNameMap, MiscInfoGenderIdentityNameMap, RootStackParamList } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
  GRAY,
  STATUS_BAR_HEIGHT,
  WIDESCREEN_HORIZONTAL_MAX
} from "../assets/styles";
import Icon from "../components/Icon";
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import VerticalView from "../components/VerticalView";
import ComplimentModal from "../components/ComplimentModal";
import { ParamListBase } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const i18n = I18N.getI18n()

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

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Profile'>
const Profile = ({ route, navigation }: Props) => {

  const MIN_AGE = 16
  const MAX_AGE = 100

  var user: UserDto = route.params.user;
  var uuid = route.params.uuid;
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets()

  const [compatible, setCompatible] = React.useState(false);
  const [isSelf, setIsSelf] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [likesMe, setLikesMe] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [you, setYou] = React.useState<UserDto>();
  const [name, setName] = React.useState("");
  const [distance, setDistance] = React.useState(0);
  const [age, setAge] = React.useState(0);
  const [profilePicture, setProfilePicture] = React.useState("");
  const [donated, setDonated] = React.useState(0);
  const [blocks, setBlocks] = React.useState(0);
  const [reports, setReports] = React.useState(0);
  const [minAge, setMinAge] = React.useState(MIN_AGE);
  const [maxAge, setMaxAge] = React.useState(MAX_AGE);
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [prompts, setPrompts] = React.useState(Array<UserPrompt>);
  const [lastActiveState, setLastActiveState] = React.useState(Number.MAX_SAFE_INTEGER);
  const [blocked, setBlocked] = React.useState(false)
  const [reported, setReported] = React.useState(false)
  const [gender, setGender] = React.useState<Gender>()
  const [preferredGenders, setPreferredGenders] = React.useState(Array<Gender>);
  const [miscInfo, setMiscInfo] = React.useState<UserMiscInfo[]>([])
  const [swiperImages, setSwiperImages] = React.useState<Array<string>>([]);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [previousScreen, setPreviousScreen] = React.useState<String | null>();
  const [reportedUser, setReportedUser] = React.useState(false)
  const [removeUser, setRemoveUser] = React.useState(false);
  const [isLegal, setIsLegal] = React.useState(false);
  const [reportOption, setReportOption] = React.useState("");
  const showMenu = () => { setMenuVisible(true) };
  const hideMenu = () => { setMenuVisible(false) };
  const maxWidth = width < WIDESCREEN_HORIZONTAL_MAX ? width : WIDESCREEN_HORIZONTAL_MAX;
  const [complimentModalVisible, setComplimentModalVisible] = React.useState(false);
  const reportOptions = [
    "fake_scam_spam",
    "inappropriate",
    "minor",
    "illegal_content",
    "other"
  ];

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

  async function load(fetch = false) {

    if (fetch || !user) {
      let response = await Global.Fetch(Global.format(URL.API_RESOURCE_PROFILE, user == null ? uuid : user.uuid));
      let data: ProfileResource = response.data;
      user = data.user;
      setYou(data.currUserDto);
      setIsLegal(data.isLegal);
    }

    setLikesMe(user.likesCurrentUser);
    setLiked(user.likedByCurrentUser);
    setHidden(user.hiddenByCurrentUser);
    setCompatible(user.compatible);
    setDistance(user.distanceToUser);
    setName(user.firstName);
    setDonated(user.totalDonations);
    setAge(user.age);
    setProfilePicture(user.profilePicture);
    setBlocked(user.blockedByCurrentUser);
    setReported(user.reportedByCurrentUser);
    setBlocks(user.numBlockedByUsers);
    setReports(user.numReports);
    setMinAge(user.preferedMinAge);
    setMaxAge(user.preferedMaxAge);
    setDescription(user.description);
    setGender(user.gender);
    if (user.email) {
      setIsSelf(true);
    }
    if (user.lastActiveState) {
      setLastActiveState(user.lastActiveState);
    }
    setPreferredGenders(user.preferedGenders);
    setInterests(Global.shuffleArray(user.interests));
    setPrompts(Global.shuffleArray(user.prompts));
    var swiperImageData: Array<string> = [];
    swiperImageData.push(user.profilePicture);
    if (user.images) {
      Global.shuffleArray(user.images).forEach(function (image) {
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

    setMiscInfo(user.miscInfos);

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

  React.useEffect(() => {
    if (reportedUser) {
      blockUser();
    }
  }, [reportedUser]);

  React.useEffect(() => {
    navigation.addListener('beforeRemove', (e: any) => {
      if (Global.SCREEN_SEARCH == previousScreen) {
        e.preventDefault();
        goBack();
      }
    });
  }, [previousScreen]);


  React.useEffect(() => {
    if (removeUser && Global.SCREEN_SEARCH == previousScreen) {
      goBack();
    }
  }, [removeUser]);

  async function goBack() {
    navigation.navigate('Main', {
      name: 'Search',
      params: { changed: removeUser },
      merge: true,
    });
  }

  async function loadPreviousScreen() {
    setPreviousScreen(await Global.GetStorage(Global.STORAGE_SCREEN));
  }

  async function blockUser() {
    await Global.Fetch(Global.format(URL.USER_BLOCK, user.uuid), 'post');
    hideMenu();
    setBlocked(true);
    setRemoveUser(true);
  }

  async function unblockUser() {
    await Global.Fetch(Global.format(URL.USER_UNBLOCK, user.uuid), 'post');
    hideMenu();
    setBlocked(false);
  }

  async function reportUser() {
    hideMenu();
    setReportModalVisible(true);
  }

  async function reportUserSend() {
    if (reportOption) {
      await Global.Fetch(Global.format(URL.USER_REPORT, user.uuid), 'post', reportOption, 'text/plain');
      setReported(true);
      setReportedUser(true);
      setReportModalVisible(false);
    }
  }

  async function likeUser(message?: string) {
    if (!message) {
      await Global.Fetch(Global.format(URL.USER_LIKE, user.uuid), 'post');
    } else {
      await Global.Fetch(Global.format(URL.USER_LIKE_MESSAGE, user.uuid, message), 'post');
    }
    setLiked(true);
    setRemoveUser(true);
    setComplimentModalVisible(false);
  }

  async function hideUser() {
    await Global.Fetch(Global.format(URL.USER_HIDE, user.uuid), 'post');
    setHidden(true);
    setRemoveUser(true);
  }

  function getMiscInfoText(map: Map<number, string>): string {
    let id = miscInfo.map(m => m.value).find(e => [...map.keys()].includes(e));
    if(id != undefined) {
      const text = map.get(id);
      return text ? i18n.t(text) : Global.EMPTY_STRING;
    } else {
      return Global.EMPTY_STRING;
    }
  }

  async function heartPressed() {
    if (likesMe) {
      likeUser();
    } else {
      setComplimentModalVisible(true);
    }
  }

  const containerStyle = { backgroundColor: colors.surface, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };
  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  return (
    <View style={{ height: height }}>
      {!isSelf &&
        <View style={{ zIndex: 1, marginBottom: insets.bottom + (Platform.OS === 'android' ? 16 : 0), position: 'absolute', width: '100%', right: 0, bottom: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: GRAY, marginRight: 24 }, hidden || !compatible || liked ? { opacity: 0.5 } : {}]} onPress={() => hideUser()}
              disabled={hidden || liked}>
              <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, !compatible || liked ? { opacity: 0.5 } : {}, { backgroundColor: colors.primary }]} onPress={heartPressed} disabled={!compatible || liked}>
              <Icon name="heart" color={LIKE_ACTIONS} size={25} />
            </TouchableOpacity>
          </View>
        </View>
      }

      <View style={[styles.top, { zIndex: 1, position: "absolute", width: '100%', marginHorizontal: 0, paddingTop: STATUS_BAR_HEIGHT + 4 }]}>
        <Pressable onPress={navigation.goBack}><MaterialCommunityIcons name="arrow-left" size={24} color={colors?.onSurface} style={{ padding: 8 }} /></Pressable>
        {!isSelf &&
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
        }
      </View>

      <VerticalView style={{ padding: 0 }} onRefresh={load}>
        <View>
          <SwiperFlatList
            autoplay
            autoplayDelay={10}
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
                <View key={index}>
                <ImageZoom
                  uri={image}
                  style={[style.image]}
                  maxScale={3}
                  doubleTapScale={2}
                  isDoubleTapEnabled
                />
                </View>
              ))
            }
          </SwiperFlatList>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 24, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: /*colors?.onSurface*/ colors?.secondary }]} />
            <Text>{distance}</Text>
            <Text>{you?.units == UnitsEnum.IMPERIAL ? ' mi' : ' km'}</Text>
          </View>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 0 }]}>

          <View>
            {interests.length > 0 && <Text style={style.title}>{i18n.t('profile.profile-page.interests')}</Text>}
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
              <Card style={{ padding: 16 }}><Text style={[styles.textInputAlign, { fontSize: 18 }]}>{description}</Text></Card>
            </View>
          </View>

          {prompts?.length > 0 &&
            <View style={{ marginTop: 20 }}>
              <ScrollView
                horizontal
                style={{ paddingBottom: 8 }}
                showsHorizontalScrollIndicator={true}
              >
                {
                  prompts?.map((item, index) => (
                    <Surface key={index} style={{ padding: 12, width: 290, borderRadius: 12, marginRight: 8 }}>
                      <Text style={{ fontSize: 14, marginBottom: 8 }}>{i18n.t('profile.prompts.' + (item.promptId))}</Text>
                      <Text style={{ fontSize: 20 }}>{item.text}</Text>
                    </Surface>
                  ))
                }
              </ScrollView>
            </View>
          }

          <View style={{ marginTop: 24 }}>
            <Text style={style.title}>{i18n.t('profile.profile-page.basics')}</Text>
            <View>

              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip icon="gender-male-female" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{gender ? i18n.t(GenderNameMap.get(gender.id) || '') : ''}</Text>
                </Chip>
                { miscInfo.map(m => m.value) &&
                  <Chip icon="gender-male-female-variant" style={[styles.marginRight4, styles.marginBottom4]}>
                    <Text>{getMiscInfoText(MiscInfoGenderIdentityNameMap)}</Text>
                  </Chip>
                }
                <Chip icon="drama-masks" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{String(minAge) + " - " + String(maxAge)}</Text>
                </Chip>
                <Chip icon="magnify" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{preferredGenders.map(g => i18n.t(GenderNameMap.get(g.id) || '')).filter(e => e).join(", ")}</Text>
                </Chip>
                <Chip icon="magnify-plus-outline" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{intention ? i18n.t(IntentionNameMap.get(intention) || '') : ''}</Text>
                </Chip>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip icon="heart-multiple" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoRelationshipNameMap)}</Text>
                </Chip>
                <Chip icon="heart-multiple-outline" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoRelationshipTypeNameMap)}</Text>
                </Chip>

                <Chip icon="baby-carriage" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoKidsNameMap)}</Text>
                </Chip>
                <Chip icon="baby-bottle" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoFamilyNameMap)}</Text>
                </Chip>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip icon="liquor" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoDrugsAlcoholNameMap)}</Text>
                </Chip>
                <Chip icon="smoking" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoDrugsTobaccoNameMap)}</Text>
                </Chip>
                <Chip icon="cannabis" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoDrugsCannabisNameMap)}</Text>
                </Chip>
                <Chip icon="pill" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoDrugsOtherNameMap)}</Text>
                </Chip>
              </View>

              <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Chip icon="vote" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoPoliticsNameMap)}</Text>
                </Chip>
                <Chip icon="hands-pray" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{getMiscInfoText(MiscInfoReligionNameMap)}</Text>
                </Chip>
              </View>

            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={style.title}>{i18n.t('profile.profile-page.additional')}</Text>
            <View style={{ paddingBottom: 4, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              <Tooltip title={i18n.t('profile.tooltip.donated')}>
                <Chip icon="hand-coin" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{String(donated) + ' €'}</Text>
                </Chip>
              </Tooltip>
              <Tooltip title={i18n.t('profile.tooltip.blocks')}>
                <Chip icon="account-cancel" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{'# ' + blocks}</Text>
                </Chip>
              </Tooltip>
              <Tooltip title={i18n.t('profile.tooltip.reports')}>
                <Chip icon="flag" style={[styles.marginRight4, styles.marginBottom4]}>
                  <Text>{'# ' + reports}</Text>
                </Chip>
              </Tooltip>
            </View>
            <View style={{ marginTop: 80 }}></View>
          </View>
        </View>

        <Portal>
          <Modal visible={reportModalVisible} onDismiss={() => setReportModalVisible(false)} contentContainerStyle={containerStyle} >
            <View>
              <IconButton
                style={{ alignSelf: 'flex-end' }}
                icon="close"
                size={20}
                onPress={() => setReportModalVisible(false)}
              />
            </View>
            <Text style={{ marginBottom: 12 }}>{i18n.t('profile.report.subtitle')}</Text>
            <View style={{ padding: 12 }}>
              <RadioButton.Group
                value={reportOption}
                onValueChange={(value: string) => setReportOption(value)}>
                <RadioButton.Item label={i18n.t('profile.report.fake')} value={reportOptions[0]} style={{ flexDirection: 'row-reverse' }} />
                <RadioButton.Item label={i18n.t('profile.report.inappropriate')} value={reportOptions[1]} style={{ flexDirection: 'row-reverse' }} />
                {isLegal && <RadioButton.Item label={i18n.t('profile.report.minor')} value={reportOptions[2]} style={{ flexDirection: 'row-reverse' }} />}
                <RadioButton.Item label={i18n.t('profile.report.illegal')} value={reportOptions[3]} style={{ flexDirection: 'row-reverse' }} />
                <RadioButton.Item label={i18n.t('profile.report.other')} value={reportOptions[4]} style={{ flexDirection: 'row-reverse' }} />
              </RadioButton.Group>
              <View style={{ flexDirection: 'row-reverse' }}>
                <Button onPress={reportUserSend}>{i18n.t('ok')}</Button>
                <Button onPress={() => { setReportModalVisible(false) }}>{i18n.t('cancel')}</Button>
              </View>
            </View>
          </Modal>
        </Portal>
        <ComplimentModal profilePicture={profilePicture} name={name} age={age} onSend={likeUser} visible={complimentModalVisible} setVisible={setComplimentModalVisible}></ComplimentModal>
      </VerticalView>
    </View>
  );
};

export default Profile;
