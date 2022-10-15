import React from "react";
import { View, Image, Dimensions, TouchableOpacity } from "react-native";
import { useTheme, Text, Button, TextInput, Switch, RadioButton, IconButton } from "react-native-paper";
import Icon from "./Icon";
import { CardItemT, UserDto } from "../types";
import * as Global from "../Global";
import styles, {
  DISLIKE_ACTIONS,
  FLASH_ACTIONS,
  LIKE_ACTIONS,
  STAR_ACTIONS,
  WHITE,
  GRAY
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

  // Custom styling
  const fullWidth = Dimensions.get("window").width;

  const imageStyle = [
    {
      borderRadius: 8,
      width: hasVariant ? fullWidth / 2 - 30 : fullWidth - 60,
      height: hasVariant ? fullWidth / 2 - 30 : fullWidth - 60,
      margin: hasVariant ? 0 : 20,
    },
  ];

  const nameStyle = [
    {
      paddingTop: hasVariant ? 10 : 0,
      paddingBottom: hasVariant ? 5 : 7,
      fontSize: hasVariant ? 15 : 20,
      textAlign: hasVariant && !hasDonation ? 'center' : 'auto',
      textAlignVertical: 'center',
      flex: 1
    },
  ];

  const cardVariant = hasVariant ? {
    width: 150, paddingBottom: 4
  } : {}


  function onLikeUser() {
    if (swiper) {
      swiper.swipeRight();
    }
  }

  function onhideUser() {
    if (swiper) {
      swiper.swipeLeft();
    }
  }

  return (
    <View style={[styles.containerCardItem, cardVariant, { backgroundColor: colors.backgroundColor }]}>
      {/* IMAGE */}
      <TouchableOpacity onPress={() => Global.nagivateProfile(user.idEncoded)}>
        <Image source={{ uri: user.profilePicture }} style={imageStyle} />
      </TouchableOpacity>

      {/* NAME */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: hasVariant? 4: 20 }}>
        <Text style={nameStyle}>{user.firstName + ", " + user.age}</Text>
        {!hasVariant &&
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: /*colors?.onSurface*/ colors?.secondary }]} />
            <Text>{user.distanceToUser}</Text>
            <Text>{unitsImperial ? ' mi' : ' km'}</Text>
          </View>
        }
        {hasDonation &&
          <View style={{ alignItems: 'center' }}>
            <Text style={[nameStyle, {paddingLeft: 4}]}>{donation?.toFixed(2) + ' €'}</Text>
          </View>
        }

      </View>

      {/* DESCRIPTION */}
      {!hasVariant && user.description && (
        <Text style={styles.descriptionCardItem}>{user.description}</Text>
      )}

      {/* ACTIONS */}
      {hasActions && (
        <View style={styles.actionsCardItem}>
          <TouchableOpacity style={[styles.button, { backgroundColor: GRAY }]} onPress={() => onhideUser()}>
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
