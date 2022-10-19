import CardStack from "react-native-card-stack-swiper";

export type CardItemT = {
  user: UserDto;
  hasActions?: boolean;
  hasVariant?: boolean;
  hasDonation?: boolean;
  unitsImperial?: boolean;
  swiper?: CardStack;
  donation?: number;
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

export type ProfileItemT = {
  age?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  location?: string;
  matches: string;
  name: string;
};

export type TabBarIconT = {
  focused: boolean;
  iconName: any;
  text: string;
};

export type DonationDtoListModel = {
  list: Array<DonationDto>;
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
  intention: number
  preferredGenders: Array<number>
  profilePicture: string
  description: string
  interests: Array<string>
}

export type Gender = {
  text: string
}

export type UserMiscInfo = {
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
  content: string
}

export type UserDto = {
  idEncoded: string
  email?: string //is null when not current user
  firstName: string
  age: number
  donationAmount: number
  gender: Gender;
  hasAudio: boolean;
  audio: string;
  accentColor: string;
  uiDesign: string;
  zodiac: string;
  showZodiac: boolean;
  units: number;
  preferedMinAge: number;
  preferedMaxAge: number;
  miscInfos: Array<UserMiscInfo>
  preferedGenders: Array<Gender>;
  intention: UserIntention;
  interests: Array<UserInterest>
  profilePicture: string;
  images: Array<UserImage>;
  description: string;
  country: string;
  distanceToUser: number;
  sameInterests: number;
  totalDonations: number;
  activeDate: Date;
  numBlockedByUsers: number;
  numReports: number;
  blockedByCurrentUser: boolean
  reportedByCurrentUser: boolean
  likedByCurrentUser: boolean
  hiddenByCurrentUser: boolean
  numberReferred: number;
  numberProfileViews: number;
  numberSearches: number;
  compatible: boolean
  hasLocation: boolean;
  locationLatitude: number;
  locationLongitude: number;
  lastActiveState: number;
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
  userIdEncoded: string;
  read: boolean;
}

export type NotificationDto = {
  id: number;
  date: Date;
  userFromDto: UserDto;
}

export enum UnitsEnum {
  SI = 0,
  IMPERIAL = 1
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
  KIDS_YES = 22
}

export type SearchDto = {
  users: Array<UserDto>;
  message: string;
  stage: SearchStageEnum;
  global: boolean;
  incompatible: boolean;
}

export type YourProfileResource = {
  user: UserDto;
  genders: Array<Gender>;
  intentions: Array<UserIntention>;
  imageMax: number,
  isLegal: boolean,
  mediaMaxSize: number,
  interestMaxSize: number,
  referralsLeft: number;
  showIntention: boolean
}

export type DonateResource = {
  user: UserDto;
}

export type DonateSearchFilterResource = {
  currUser: UserDto;
  donations: Array<DonationDto>;
  filter: number;
}

export type ChatDetailResource = {
  user: UserDto;
  convoId: number;
  partner: UserDto;
}

export type ChatMessageUpdateResource = {
  messages: Array<MessageDto>;
}

export type AlertsResource = {
  notifications: Array<NotificationDto>;
  user: UserDto;
}

export type ProfileResource = {
  compatible: boolean;
  user: UserDto;
  currUserDto: UserDto;
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
  conversations: Array<ConversationDto>;
}

export type MessageDtoListModel = {
  list: Array<MessageDto> ;
}