import React from "react";
import { View, Image, TouchableOpacity, StyleProp, TextStyle, FlatList, ScrollView, StyleSheet, useWindowDimensions, TouchableWithoutFeedback } from "react-native";
import { useTheme, Text, Chip } from "react-native-paper";
import Icon from "./Icon";
import { CardItemT } from "../types";
import * as Global from "../Global";
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
  GRAY,
  NAVIGATION_BAR_HEIGHT,
  WIDESCREEN_HORIZONTAL_MAX
} from "../assets/styles";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';
import * as I18N from "../i18n";

const CardItem = ({
  user,
  unitsImperial,
  swiper,
  onLikePressed,
  index
}: CardItemT) => {

  const { colors } = useTheme();
  const i18n = I18N.getI18n();

  const { height, width } = useWindowDimensions();
  const cardPadding = 8;

  const [showLikeTooltip, setShowLikeTooltip] = React.useState(false);

  const style = StyleSheet.create({
    image: {
      borderRadius: cardPadding,
      width: calcImageSize(),
      height: 'auto',
      maxWidth: WIDESCREEN_HORIZONTAL_MAX - cardPadding * 2,
      marginTop: cardPadding / 2 + 2,
      marginBottom: cardPadding / 2,
      aspectRatio: 1,
    },
  });

  function calcImageSize(): number {
    if (width <= 380) {
      return width - (380 - width);
    }
    return width + 300 < height ? width - cardPadding * 2 : height / (height < 900 ? 2 : 1.5) - cardPadding * 2;
  }

  const nameStyle: StyleProp<TextStyle> = [
    {
      fontSize: 20,
      textAlign: 'auto',
      textAlignVertical: 'center'
    },
  ];

  React.useEffect(() => {
    showToolTip();
  }, []);

  async function showToolTip() {
    if(index == 0) {
      let toolTip = await Global.GetStorage(Global.STORAGE_SEARCH_LIKE_TOOLTIP);
      if(!toolTip) {
        setShowLikeTooltip(true);
        Global.SetStorage(Global.STORAGE_SEARCH_LIKE_TOOLTIP, "1");
      }
    }
  }

  function onLikeUser() {
    if(onLikePressed) {
      onLikePressed();
    }
    setShowLikeTooltip(false);
  }

  function onHideUser() {
    swiper.current?.swipeLeft();
  }

  return (
    <View style={[styles.containerCardItem, { paddingHorizontal: 20, backgroundColor: colors.surface, maxWidth: WIDESCREEN_HORIZONTAL_MAX, height: height - NAVIGATION_BAR_HEIGHT - cardPadding, width: width - cardPadding }]}>
      {/* IMAGE */}
      <TouchableOpacity onPress={() => Global.nagivateProfile(user)}>
        <Image source={{ uri: user.profilePicture ? user.profilePicture : undefined }} style={style.image} />
      </TouchableOpacity>

      {/* NAME */}
      <TouchableWithoutFeedback onPress={() => Global.nagivateProfile(user)}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingTop: 4, paddingBottom: 10, }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row' }}><Text style={nameStyle}>{user.firstName + ", " + user.age}</Text></View>
            {user.lastActiveState <= 2 && <MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ paddingLeft: 6 }} />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: colors?.secondary }]} />
            <Text>{user.distanceToUser}</Text>
            <Text>{unitsImperial ? ' mi' : ' km'}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* COMMON INTERESTS */}{user.commonInterests.length > 0 &&
        <TouchableWithoutFeedback onPress={() => Global.nagivateProfile(user)} style={styles.marginBottom4}>
          <View style={{ alignSelf: 'stretch', paddingBottom: 8,}}>
            <Text style={styles.marginBottom4}>{i18n.t('profile.interests-common')}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
              {
                user.commonInterests?.map((item, index) => (
                  <Chip key={index} style={[styles.marginRight4, styles.marginBottom4]}><Text>{item.text}</Text></Chip>
                ))
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
      }

      {/* DESCRIPTION */}
      {user.description && (
        <ScrollView nestedScrollEnabled={true} style={{ flexGrow: 1, width: '100%' }}>
          <TouchableWithoutFeedback onPress={() => Global.nagivateProfile(user)}>
            <Text style={styles.descriptionCardItem}>{user.description}</Text>
          </TouchableWithoutFeedback>
        </ScrollView>
      )}

      {/* ACTIONS */}
      <View style={styles.actionsCardItem}>
        <TouchableOpacity style={[styles.button, { backgroundColor: GRAY, marginRight: 24 }]} onPress={() => onHideUser()}>
          <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
        </TouchableOpacity>
        <Tooltip
          contentStyle={{
            backgroundColor: colors.surface
          }}
          isVisible={showLikeTooltip}
          content={<Text>{i18n.t('compliment.tooltip')}</Text>}
          placement="top"
          disableShadow={true}
          onClose={() => setShowLikeTooltip(false)}
        >
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => onLikeUser()}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
  );
};

export default CardItem;
