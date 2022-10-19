import React from "react";
import {
  ScrollView,
  View,
  ImageBackground,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { useTheme, Text, Button, Chip, Card } from "react-native-paper";
import { YourProfileResource, UserMiscInfoEnum, UserInterest, UnitsEnum, ProfileResource, UserDto } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProfileCardItem from "../components/ProfileCardItem";
import styles, {
  DISLIKE_ACTIONS,
  FLASH_ACTIONS,
  LIKE_ACTIONS,
  STAR_ACTIONS,
  WHITE,
  GRAY
} from "../assets/styles";
import Icon from "../components/Icon";


const IMAGE_HEADER = "data:image/png;base64,";

const i18n = I18N.getI18n()
const MAX_INTERESTS = 5;
const MIN_AGE = 16
const MAX_AGE = 100

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

  const { idEnc } = route.params;
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
  const [minAge, setMinAge] = React.useState(MIN_AGE);
  const [maxAge, setMaxAge] = React.useState(MAX_AGE);
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [blocked, setBlocked] = React.useState(false)
  const [gender, setGender] = React.useState<Gender>()
  const [preferredGenders, setPreferredGenders] = React.useState(Array<Gender>);
  const [relationshipString, setRelationshipString] = React.useState<String>();
  const [kidsString, setKidsString] = React.useState<String>();
  const [drugsString, setDrugsString] = React.useState<String>();


  function convertGenderText(text: string): Gender {
    switch (text) {
      case GenderText.MALE:
        return Gender.MALE;
      case GenderText.FEMALE:
        return Gender.FEMALE;
    }
    return Gender.OTHER;
  }

  async function load() {
    navigation.setOptions({ title: "" });
    let response = await Global.Fetch(Global.format(URL.API_RESOURCE_PROFILE, idEnc));
    let data: ProfileResource = response.data;
    console.log(data.user.likedByCurrentUser)
    setLiked(data.user.likedByCurrentUser);
    setHidden(data.user.hiddenByCurrentUser);
    setYou(data.currUserDto);
    setCompatible(data.compatible);
    setProfilePic(data.user.profilePicture);
    setDistance(data.user.distanceToUser);
    setName(data.user.firstName);
    setDonated(data.user.totalDonations);
    setAge(data.user.age);
    setBlocked(data.user.blockedByCurrentUser);
    setBlocks(data.user.numBlockedByUsers);
    setMinAge(data.user.preferedMinAge);
    setMaxAge(data.user.preferedMaxAge);
    setDescription(data.user.description);
    setGender(convertGenderText(data.user.gender.text));
    let prefGenders: Array<Gender> = [];
    for (let i = 0; i < data.user.preferedGenders.length; i++) {
      prefGenders.push(convertGenderText(data.user.preferedGenders[i].text));
    }
    setPreferredGenders(prefGenders);
    setInterests(data.user.interests);

    let intentionText = data.user.intention.text;
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

    let miscInfoData = data.user.miscInfos.map(item => item.value);

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
    load();
  }, []);

  React.useEffect(() => {
    load();
  }, [relationshipString]);

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
    await Global.Fetch(Global.format(URL.USER_BLOCK, idEnc), 'post');
    setBlocked(true);
  }

  async function unblockUser() {
    await Global.Fetch(Global.format(URL.USER_UNBLOCK, idEnc), 'post');
    setBlocked(false);
  }

  async function likeUser() {
    await Global.Fetch(Global.format(URL.USER_LIKE, idEnc), 'post');
    setLiked(true);
  }

  async function hideUser() {
    await Global.Fetch(Global.format(URL.USER_HIDE, idEnc), 'post');
    setHidden(true);
  }

  return (
    <View>
      <ScrollView style={styles.containerProfile} keyboardShouldPersistTaps='handled'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>

        <ImageBackground source={{ uri: profilePic ? profilePic : undefined }} style={styles.photo}>
        </ImageBackground>

        <View style={[styles.containerProfileItem, { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' }]}>
          <Text style={{ fontSize: 24 }}>{name + ", " + age}</Text>
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
              <ProfileCardItem title={i18n.t('gender.title')} subtitle={gender == Gender.MALE ? i18n.t('gender.male') :
                gender == Gender.FEMALE ? i18n.t('gender.female') : i18n.t('gender.other')}></ProfileCardItem>
              <ProfileCardItem title={i18n.t('profile.intention.title')} subtitle={intention == Intention.MEET ? i18n.t('profile.intention.meet') :
                intention == Intention.DATE ? i18n.t('profile.intention.date') : i18n.t('profile.intention.sex')}></ProfileCardItem>
              <ProfileCardItem title={i18n.t('profile.gender')} subtitle={getGendersText()}></ProfileCardItem>
              <ProfileCardItem title={i18n.t('profile.preferred-age-range')} subtitle={String(minAge) + " - " + String(maxAge)}></ProfileCardItem>
            </ScrollView>
            {(relationshipString || kidsString || drugsString) && <ScrollView horizontal={true} style={{ marginTop: 32 }}>
              {relationshipString && <ProfileCardItem title={i18n.t('profile.misc-info.relationship.title')} subtitle={relationshipString}></ProfileCardItem>}
              {kidsString && <ProfileCardItem title={i18n.t('profile.misc-info.kids.title')} subtitle={kidsString}></ProfileCardItem>}
              {drugsString && <ProfileCardItem title={i18n.t('profile.misc-info.drugs.title')} subtitle={drugsString}></ProfileCardItem>}
            </ScrollView>}
            <ScrollView horizontal={true} style={{ marginTop: 32 }}>
              <ProfileCardItem title={i18n.t('profile.donated')} subtitle={String(donated) + ' €'}></ProfileCardItem>
              <ProfileCardItem title={i18n.t('profile.num-blocks')} subtitle={blocks}></ProfileCardItem>
            </ScrollView>
            <View style={{ marginTop: 12, marginBottom: 82 }}>
              {!blocked && <Button icon="block-helper" mode="contained" onPress={blockUser}><Text>{i18n.t('profile.block')}</Text></Button>}
              {blocked && <Button icon="block-helper" mode="contained" onPress={unblockUser} buttonColor={colors.secondary}><Text>{i18n.t('profile.unblock')}</Text></Button>}
            </View>
          </View>
        </View>
      </ScrollView>
      {!liked && <View style={{ marginBottom: 8, position: 'absolute', width: Dimensions.get('window').width, right: 0, bottom: 0, }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={[styles.button, { backgroundColor: GRAY }, hidden ? { opacity: 0.5 } : {}]} onPress={() => hideUser()}
            disabled={hidden}>
            <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => likeUser()}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
        </View>
      </View>}
    </View>
  );
};

export default Profile;
