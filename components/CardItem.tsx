import React from "react";
import { Text, View, Image, Dimensions, TouchableOpacity } from "react-native";
import Icon from "./Icon";
import { CardItemT, UserDto } from "../types";
import styles, {
  DISLIKE_ACTIONS,
  FLASH_ACTIONS,
  LIKE_ACTIONS,
  STAR_ACTIONS,
  WHITE,
  GRAY
} from "../assets/styles";
import { FontAwesome } from '@expo/vector-icons';

const CardItem = ({
  user,
  hasActions,
  hasVariant,
  unitsImperial,
  swiper
}: CardItemT) => {
  // Custom styling
  const fullWidth = Dimensions.get("window").width;

  const imageStyle = [
    {
      borderRadius: 8,
      width: hasVariant ? fullWidth / 2 - 30 : fullWidth - 80,
      height: hasVariant ? fullWidth / 2 - 30 : fullWidth - 80,
      margin: hasVariant ? 0 : 20,
    },
  ];

  const nameStyle = [
    {
      //paddingTop: hasVariant ? 10 : 15,
      paddingBottom: hasVariant ? 5 : 7,
      color: "#363636",
      fontSize: hasVariant ? 15 : 20,
    },
  ];

  function onLikeUser() {
    if(swiper) {
      swiper.swipeRight();
    }
  }

  function onhideUser() {
    if(swiper) {
      swiper.swipeLeft();
    }
  }

  return (
    <View style={styles.containerCardItem}>
      {/* IMAGE */}
      <Image source={{ uri: user.profilePicture }} style={imageStyle} />

      {/* NAME */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingLeft: 24, paddingRight: 24}}>
        <Text style={nameStyle}>{user.firstName + ", " + user.age}</Text>
        <View style={{flexDirection: 'row'}}>
          <FontAwesome name="map-marker" size={18} style={{paddingRight: 4}}/>
          <Text>{user.distanceToUser}</Text>
          <Text>{unitsImperial ? ' mi' : ' km'}</Text>
          </View>
      </View>

      {/* DESCRIPTION */}
      {user.description && (
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
