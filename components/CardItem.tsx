import React from "react";
import { View, Image, Dimensions, TouchableOpacity, StyleProp, TextStyle, FlatList, ScrollView, useWindowDimensions } from "react-native";
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

const CardItem = ({
  user,
  hasActions,
  hasVariant,
  hasDonation,
  unitsImperial,
  swiper,
  donation
}: CardItemT) => {

  const { colors } = useTheme();

  const { height, width } = useWindowDimensions();
  const imageSize = height < 840 ? height < 640 ? height / 2 : height / 1.5 : height;
  const imagePadding = 30;

  const imageStyle = [
    {
      borderRadius: 8,
      width: imageSize - imagePadding,
      height: imageSize - imagePadding,
      maxWidth: WIDESCREEN_HORIZONTAL_MAX - imagePadding,
      maxHeight: WIDESCREEN_HORIZONTAL_MAX - imagePadding,
      marginTop: 26,
      marginBottom: 4,
    },
  ];

  const nameStyle: StyleProp<TextStyle> = [
    {
      paddingTop: 4,
      paddingBottom: 7,
      fontSize: 20,
      textAlign: 'auto',
      textAlignVertical: 'center'
    },
  ];

  function onLikeUser() {
    swiper.current?.swipeRight();
  }

  function onhideUser() {
    swiper.current?.swipeLeft();
  }

  return (
    <View style={[styles.containerCardItem, { backgroundColor: colors.background, maxWidth: WIDESCREEN_HORIZONTAL_MAX, height: height - NAVIGATION_BAR_HEIGHT - 8, width: width - 8}]}>
      {/* IMAGE */}
      <TouchableOpacity onPress={() => Global.nagivateProfile(user)}>
        <Image source={{ uri: user.profilePicture ? user.profilePicture : undefined }} style={imageStyle} />
      </TouchableOpacity>

      {/* NAME */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: hasVariant ? 4 : 20 }}>
        <View style={{ flexDirection: 'row' }}><Text style={nameStyle}>{user.firstName + ", " + user.age}</Text>
          {!hasVariant && user.lastActiveState <= 2 && <MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ padding: 6, paddingTop: 10 }} />}
        </View>
        {!hasVariant &&
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: /*colors?.onSurface*/ colors?.secondary }]} />
            <Text>{user.distanceToUser}</Text>
            <Text>{unitsImperial ? ' mi' : ' km'}</Text>
          </View>
        }
        {hasDonation &&
          <View style={{ alignItems: 'center' }}>
            <Text style={[nameStyle, { paddingLeft: 4 }]}>{donation + ' €'}</Text>
          </View>
        }
      </View>

      {/* COMMON INTERESTS */}
      {!hasVariant && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingLeft: 20 }}>
        <FlatList
          style={{ marginBottom: 4 }}
          horizontal={true}
          data={user.commonInterests}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Chip style={[styles.marginRight4, { transform: [{ scale: 0.8 }] }]}>{item.text}</Chip>
          )}
        />
      </View>
      }

      {/* DESCRIPTION */}
      {!hasVariant && user.description && (
        <ScrollView>
          <Text style={styles.descriptionCardItem}>{user.description}</Text>
        </ScrollView>
      )}

      {/* ACTIONS */}
      {hasActions && (
        <View style={styles.actionsCardItem}>
          <TouchableOpacity style={[styles.button, { backgroundColor: GRAY, marginRight: 24 }]} onPress={() => onhideUser()}>
            <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => onLikeUser()}>
            <Icon name="heart" color={LIKE_ACTIONS} size={25} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CardItem;
