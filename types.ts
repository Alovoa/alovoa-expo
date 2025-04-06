import * as Global from "./Global"; 

export { MaterialBottomTabNavigator } from './types-hack';

export type RootStackParamList = {
  [Global.SCREEN_CHAT]: undefined;
  [Global.SCREEN_DONATE]: undefined;
  [Global.SCREEN_LIKES]: undefined;
  Login: undefined;
  Main: object;
  MessageDetail: {
    conversation: ConversationDto;
  };
  Onboarding: undefined;
  PasswordReset: undefined;
  Profile: {
    user: UserDto;
    uuid: string;
  };
  [Global.SCREEN_PROFILE_ADVANCED_SETTINGS]: {
    user: UserDto
  };
  [Global.SCREEN_PROFILE_PICTURES]: {
    changed: boolean;
    user: UserDto;
  };
  'Profile.Prompts': {
    user: UserDto;
  };
  [Global.SCREEN_PROFILE_PROFILESETTINGS]: {
    data: YourProfileResource;
    user: UserDto;
  };
  [Global.SCREEN_PROFILE_SEARCHSETTINGS]: {
    data: YourProfileResource
  }
  [Global.SCREEN_PROFILE_SETTINGS]: {
    data: YourProfileResource
  };
  Register: {
    registerEmail: boolean
  };
  [Global.SCREEN_SEARCH]: {
    changed: boolean
  };
  [Global.SCREEN_YOURPROFILE]: {
    changed: boolean
  };
};

export type CardItemT = {
  user: UserDto;
  donation?: number;
  unitsImperial?: boolean;
  swiper?: any;
  message?: string;
  index?: number;
  onLikePressed?: () => void;
  onMessagePressed?: (result: LikeResultT) => void;
};

export type IconT = {
  name: any;
  size: number;
  color: string;
  style?: any;
};

export type MessageT = {
  conversation: ConversationDto;
};

export type TabBarIconT = {
  focused: boolean;
  iconName: any;
  text: string;
};

export type SelectModalT = {
  disabled: boolean,
  multi: boolean,
  minItems: number,
  title: string;
  data: [number, string | undefined][];
  selected: number[];
  onValueChanged: (id: number, checked: boolean) => void
};

export type ComplimentModalT = {
  visible: boolean,
  setVisible: (state: boolean) => void,
  name: string,
  age: number,
  profilePicture: string,
  onSend: (message: string, pop?: boolean) => void,
  onDismiss?: () => void;
};

export type RangeSliderModalT = {
  title: string;
  titleLower: string,
  titleUpper: string,
  valueLower: number,
  valueUpper: number,
  onValueLowerChanged: (value: number) => void,
  onValueUpperChanged: (value: number) => void
};

export type InterestModalT = {
  data: UserInterest[];
  user?: UserDto;
  updateButtonText?: (interests: UserInterest[]) => void;
  setInterestsExternal?: (interests: UserInterest[]) => void;
};

export type DonationDtoListModel = {
  list: DonationDto[];
}

export type RegisterBody = {
  email?: string
  password?: string
  firstName: string;
  dateOfBirth: Date;
  referrerCode?: string
  gender: number
  termsConditions: boolean
  privacy: boolean;
}

export type UserInterestAutocomplete = {
  count: number
  countString: string
  name: string
}

export type UserOnboarding = {
  intention: number;
  preferredGenders: number[];
  profilePictureMime: string;
  description: string;
  interests: string[];
  notificationLike: boolean;
  notificationChat: boolean;
}

export type Gender = {
  id: number;
  text: string
}

export type UserMiscInfo = {
  id: number;
  value: number;
}

export type UserIntention = {
  id: number;
  text: string
}

export type UserInterest = {
  text: string
}

export type UserImage = {
  id: number;
  content: string;
}

export type DataT = {
    id: number
    name: string
    isOnline: boolean
    match: string
    description: string
    age?: string
    location?: string
    info1?: string
    info2?: string
    info3?: string
    info4?: string
    message: string
    image: string
}

export type UserDto = {
  uuid: string
  email?: string //is null when not current user
  firstName: string
  age: number
  donationAmount: number
  gender: Gender;
  hasAudio: boolean;
  audio: string;
  units: number;
  preferedMinAge: number;
  preferedMaxAge: number;
  miscInfos: UserMiscInfo[]
  preferedGenders: Gender[];
  intention: UserIntention;
  interests: UserInterest[]
  profilePicture: string;
  images: UserImage[];
  description: string;
  country: string;
  distanceToUser: number;
  commonInterests: UserInterest[];
  totalDonations: number;
  numBlockedByUsers: number;
  numReports: number;
  blockedByCurrentUser: boolean;
  reportedByCurrentUser: boolean;
  likesCurrentUser: boolean;
  likedByCurrentUser: boolean;
  hiddenByCurrentUser: boolean;
  numberReferred: number;
  compatible: boolean
  hasLocation: boolean;
  locationLatitude: number;
  locationLongitude: number;
  lastActiveState: number;
  userSettings: UserSettings;
  prompts: UserPrompt[];
  verificationPicture: UserDtoVerificationPicture;
}

export type UserSettings = {
  emailLike: boolean;
  emailChat: boolean;
}

export type UserInterestDto = {
  id: string,
  number: string
}

export type UserPrompt = {
  promptId: number,
  text: string
}

export type DonationDto = {
  id: number;
  date: Date;
  user: UserDto;
  amount: number;
}

export type MessageDto = {
  id: number;
  content: string;
  date: Date;
  from: boolean;
  allowedFormatting: boolean;
}

export type ConversationDto = {
  id: number;
  lastUpdated: Date;
  userName: string;
  userProfilePicture: string;
  lastMessage: MessageDto;
  uuid: string;
  read: boolean;
}

export type NotificationDto = {
  id: number;
  date: Date;
  message: string;
  userFromDto: UserDto;
}

export enum UnitsEnum {
  SI = 0,
  IMPERIAL = 1
}

export enum SettingsEmailEnum {
  LIKE = 1,
  CHAT = 2
}

export enum SearchStageEnum {
  NORMAL,
  INCREASED_RADIUS_1,
  INCREASED_RADIUS_2,
  WORLD,
  IGNORE_1,
  IGNORE_2,
  IGNORE_ALL
}

export enum UserMiscInfoEnum {
  DRUGS_TOBACCO = 1,
  DRUGS_ALCOHOL = 2,
  DRUGS_CANNABIS = 3,
  DRUGS_OTHER = 4,
  RELATIONSHIP_SINGLE = 11,
  RELATIONSHIP_TAKEN = 12,
  RELATIONSHIP_OPEN = 13,
  RELATIONSHIP_OTHER = 14,
  KIDS_NO = 21,
  KIDS_YES = 22,
  DRUGS_TOBACCO_NO = 31,
  DRUGS_ALCOHOL_NO = 32,
  DRUGS_CANNABIS_NO = 33,
  DRUGS_OTHER_NO = 34,
  DRUGS_TOBACCO_SOMETIMES = 41,
  DRUGS_ALCOHOL_SOMETIMES = 42,
  DRUGS_CANNABIS_SOMETIMES = 43,
  DRUGS_OTHER_SOMETIMES = 44,
  RELATIONSHIP_TYPE_MONOGAMOUS = 51,
  RELATIONSHIP_TYPE_POLYAMOROUS = 52,
  GENDER_IDENTITY_CIS = 61,
  GENDER_IDENTITY_TRANS = 62,
  POLITICS_MODERATE = 71,
  POLITICS_LEFT = 72,
  POLITICS_RIGHT = 73,
  RELIGION_NO = 81,
  RELIGION_YES = 82,
  FAMILY_WANT = 91,
  FAMILY_NOT_WANT = 92,
  FAMILY_NOT_SURE = 93,
}

export enum GenderEnum {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3
}

export enum IntentionEnum {
  MEET = 1,
  DATE = 2,
  SEX = 3,
}

export type SearchDto = {
  users: UserDto[];
  message: string;
  stage: SearchStageEnum;
  global: boolean;
  incompatible: boolean;
}

export type YourProfileResource = {
  user: UserDto;
  genders: Gender[];
  intentions: UserIntention[];
  imageMax: number,
  isLegal: boolean,
  mediaMaxSize: number,
  interestMaxSize: number,
  referralsLeft: number;
  showIntention: boolean
  "settings.ignoreIntention": boolean;
}

export type DonateResource = {
  user: UserDto;
}

export type DonateSearchFilterResource = {
  currUser: UserDto;
  donations: DonationDto[];
  filter: number;
}

export type ChatDetailResource = {
  user: UserDto;
  convoId: number;
  partner: UserDto;
}

export type ChatMessageUpdateResource = {
  messages: MessageDto[];
}

export type AlertsResource = {
  notifications: NotificationDto[];
  user: UserDto;
}

export type ProfileResource = {
  compatible: boolean;
  user: UserDto;
  currUserDto: UserDto;
  isLegal: boolean,
}

export type SearchResource = {
  user: UserDto;
}

export type SearchUsersResource = {
  dto: SearchDto;
  currUser: UserDto;
}

export type ChatsResource = {
  user: UserDto;
  conversations: ConversationDto[];
}

export type MessageDtoListModel = {
  list: MessageDto[];
}

export type UserOnboardingResource = {
  genders: Gender[];
  intentions: UserIntention[];
  isLegal: boolean;
  mediaMaxSize: number
  interestMaxSize: number;
}

export type UserUsersResource = {
  users: UserDto[];
  user: UserDto;
}

export type UserDtoVerificationPicture = {
  verifiedByAdmin: boolean;
  verifiedByUsers: boolean;
  votedByCurrentUser: boolean;
  hasPicture: boolean;
  data: string;
  text: string;
  uuid: string;
  userYes: number;
  userNo: number;
}

export type AlertModel = {
  visible: boolean;
  message: string;
  buttons: AlertButtonModel[];
  setVisible: (bool: boolean) => void;
}

export type AlertButtonModel = {
  text: string;
  onPress: () => void;
}

export type Captcha = {
  id: number;
  image: string;
}

export type PasswordResetDto = {
  captchaId: number;
  captchaText: string;
  email: string;
}

export type LikeResultT = {
  user: UserDto;
  message?: string;
}

export const GenderMap = new Map<number, string>([
  [GenderEnum.MALE, "male"],
  [GenderEnum.FEMALE, "female"],
  [GenderEnum.OTHER, "other"],
]);

export enum IntentionE {
  MEET = 1,
  DATE = 2,
  SEX = 3
}

export type SearchParams = {
    distance?: number;
    preferredGenderIds?: number[]
    preferredMinAge?: number;
    preferredMaxAge?: number;
    showOutsideParameters?: boolean;
    sort?: SearchParamsSortE;
    latitude?: number;
    longitude?: number;
    miscInfos?: number[];
    intentions?: number[];
    interests?: string[];
}

export enum SearchParamsSortE {
  DISTANCE = 1,
  ACTIVE_DATE = 2,
  INTEREST = 3,
  DEFAULT = 4,
  DONATION_TOTAL = 5,
  NEWEST_USER = 6,
}

export const MiscInfoNameMap = new Map<number, string>([
  [UserMiscInfoEnum.RELATIONSHIP_SINGLE, 'profile.misc-info.relationship.single'],
  [UserMiscInfoEnum.RELATIONSHIP_TAKEN, 'profile.misc-info.relationship.taken'],
  [UserMiscInfoEnum.RELATIONSHIP_OPEN, 'profile.misc-info.relationship.open'],
  [UserMiscInfoEnum.RELATIONSHIP_OTHER, 'profile.misc-info.relationship.other'],
  [UserMiscInfoEnum.KIDS_NO, 'profile.misc-info.kids.no'],
  [UserMiscInfoEnum.KIDS_YES, 'profile.misc-info.kids.yes'],
  [UserMiscInfoEnum.FAMILY_WANT, 'profile.misc-info.family.yes'],
  [UserMiscInfoEnum.FAMILY_NOT_WANT, 'profile.misc-info.family.no'],
  [UserMiscInfoEnum.FAMILY_NOT_SURE, 'profile.misc-info.family.not-sure'],
  [UserMiscInfoEnum.RELATIONSHIP_TYPE_MONOGAMOUS, 'profile.misc-info.relationship-type.monogamous'],
  [UserMiscInfoEnum.RELATIONSHIP_TYPE_POLYAMOROUS, 'profile.misc-info.relationship-type.polyamorous'],
  [UserMiscInfoEnum.POLITICS_LEFT, 'profile.misc-info.politics.left'],
  [UserMiscInfoEnum.POLITICS_MODERATE, 'profile.misc-info.politics.moderate'],
  [UserMiscInfoEnum.POLITICS_RIGHT, 'profile.misc-info.politics.right'],
  [UserMiscInfoEnum.GENDER_IDENTITY_CIS, 'profile.misc-info.gender-identity.cis'],
  [UserMiscInfoEnum.GENDER_IDENTITY_TRANS, 'profile.misc-info.gender-identity.trans'],
  [UserMiscInfoEnum.RELIGION_YES, 'profile.misc-info.religion.yes'],
  [UserMiscInfoEnum.RELIGION_NO, 'profile.misc-info.religion.no'],
  [UserMiscInfoEnum.DRUGS_ALCOHOL, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_ALCOHOL_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_ALCOHOL_NO, 'profile.misc-info.no'],
  [UserMiscInfoEnum.DRUGS_TOBACCO, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_TOBACCO_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_TOBACCO_NO, 'profile.misc-info.no'],
  [UserMiscInfoEnum.DRUGS_CANNABIS, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_CANNABIS_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_CANNABIS_NO, 'profile.misc-info.no'],
  [UserMiscInfoEnum.DRUGS_OTHER, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_OTHER_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_OTHER_NO, 'profile.misc-info.no'],
]); 

export const MiscInfoRelationshipNameMap = new Map<number, string>([
  [UserMiscInfoEnum.RELATIONSHIP_SINGLE, 'profile.misc-info.relationship.single'],
  [UserMiscInfoEnum.RELATIONSHIP_TAKEN, 'profile.misc-info.relationship.taken'],
  [UserMiscInfoEnum.RELATIONSHIP_OPEN, 'profile.misc-info.relationship.open'],
  [UserMiscInfoEnum.RELATIONSHIP_OTHER, 'profile.misc-info.relationship.other'],
]);

export const MiscInfoKidsNameMap = new Map<number, string>([
  [UserMiscInfoEnum.KIDS_NO, 'profile.misc-info.kids.no'],
  [UserMiscInfoEnum.KIDS_YES, 'profile.misc-info.kids.yes'],
]); 

export const MiscInfoFamilyNameMap = new Map<number, string>([
  [UserMiscInfoEnum.FAMILY_WANT, 'profile.misc-info.family.yes'],
  [UserMiscInfoEnum.FAMILY_NOT_WANT, 'profile.misc-info.family.no'],
  [UserMiscInfoEnum.FAMILY_NOT_SURE, 'profile.misc-info.family.not-sure'],
]); 

export const MiscInfoRelationshipTypeNameMap = new Map<number, string>([
  [UserMiscInfoEnum.RELATIONSHIP_TYPE_MONOGAMOUS, 'profile.misc-info.relationship-type.monogamous'],
  [UserMiscInfoEnum.RELATIONSHIP_TYPE_POLYAMOROUS, 'profile.misc-info.relationship-type.polyamorous'],
]); 

export const MiscInfoPoliticsNameMap = new Map<number, string>([
  [UserMiscInfoEnum.POLITICS_LEFT, 'profile.misc-info.politics.left'],
  [UserMiscInfoEnum.POLITICS_MODERATE, 'profile.misc-info.politics.moderate'],
  [UserMiscInfoEnum.POLITICS_RIGHT, 'profile.misc-info.politics.right'],
]); 

export const MiscInfoGenderIdentityNameMap = new Map<number, string>([
  [UserMiscInfoEnum.GENDER_IDENTITY_CIS, 'profile.misc-info.gender-identity.cis'],
  [UserMiscInfoEnum.GENDER_IDENTITY_TRANS, 'profile.misc-info.gender-identity.trans'],
]); 

export const MiscInfoReligionNameMap = new Map<number, string>([
  [UserMiscInfoEnum.RELIGION_YES, 'profile.misc-info.religion.yes'],
  [UserMiscInfoEnum.RELIGION_NO, 'profile.misc-info.religion.no'],
]); 

export const MiscInfoDrugsAlcoholNameMap = new Map<number, string>([
  [UserMiscInfoEnum.DRUGS_ALCOHOL, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_ALCOHOL_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_ALCOHOL_NO, 'profile.misc-info.no'],
]); 

export const MiscInfoDrugsTobaccoNameMap = new Map<number, string>([
  [UserMiscInfoEnum.DRUGS_TOBACCO, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_TOBACCO_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_TOBACCO_NO, 'profile.misc-info.no'],
]); 

export const MiscInfoDrugsCannabisNameMap = new Map<number, string>([
  [UserMiscInfoEnum.DRUGS_CANNABIS, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_CANNABIS_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_CANNABIS_NO, 'profile.misc-info.no'],
]); 

export const MiscInfoDrugsOtherNameMap = new Map<number, string>([
  [UserMiscInfoEnum.DRUGS_OTHER, 'profile.misc-info.yes'],
  [UserMiscInfoEnum.DRUGS_OTHER_SOMETIMES, 'profile.misc-info.sometimes'],
  [UserMiscInfoEnum.DRUGS_OTHER_NO, 'profile.misc-info.no'],
]); 

export const IntentionNameMap = new Map<number, string>([
  [IntentionE.MEET, 'profile.intention.meet'],
  [IntentionE.DATE, 'profile.intention.date'],
  [IntentionE.SEX, 'profile.intention.sex'],
]); 

export const GenderNameMap = new Map<number, string>([
  [GenderEnum.MALE, 'gender.male'],
  [GenderEnum.FEMALE, 'gender.female'],
  [GenderEnum.OTHER, 'gender.other'],
]); 

export const UnitsNameMap = new Map<number, string>([
  [UnitsEnum.SI, 'profile.units.si'],
  [UnitsEnum.IMPERIAL, 'profile.units.imperial'],
]); 

export const SettingsEmailNameMap = new Map<number, string>([
  [SettingsEmailEnum.LIKE, 'profile.settings.email.like'],
  [SettingsEmailEnum.CHAT, 'profile.settings.email.chat'],
]);
