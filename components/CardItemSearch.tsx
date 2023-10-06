import React from "react";
import { View, Image, Dimensions, TouchableOpacity, StyleProp, TextStyle, FlatList, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme, Text, Chip } from "react-native-paper";
import Icon from "./Icon";
import { CardItemT } from "../types";
import * as Global from "../Global";
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
  GRAY,
  NAVIGATION_BAR_HEIGHT,
  WIDESCREEN_HORIZONTAL_MAX,
  STATUS_BAR_HEIGHT
} from "../assets/styles";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CardItem = ({
  user,
  unitsImperial,
  swiper,
}: CardItemT) => {

  const { colors } = useTheme();

  const { height, width } = useWindowDimensions();
  const cardPadding = 8;

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

  function onLikeUser() {
    swiper.current?.swipeRight();
  }

  function onhideUser() {
    swiper.current?.swipeLeft();
  }

  return (
    <View style={[styles.containerCardItem, { backgroundColor: colors.surface, maxWidth: WIDESCREEN_HORIZONTAL_MAX, height: height - NAVIGATION_BAR_HEIGHT - cardPadding - STATUS_BAR_HEIGHT, width: width - cardPadding }]}>
      {/* IMAGE */}
      <TouchableOpacity onPress={() => Global.nagivateProfile(user)}>
        <Image source={{ uri: user.profilePicture ? user.profilePicture : undefined }} style={style.image} />
      </TouchableOpacity>

      {/* NAME */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 7, }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{ flexDirection: 'row' }}><Text style={nameStyle}>{user.firstName + ", " + user.age}</Text></View>
          {user.lastActiveState <= 2 && <MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ paddingLeft: 6 }} />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="map-marker" size={18} style={[{ paddingRight: 4, color: colors?.secondary }]} />
          <Text>{user.distanceToUser}</Text>
          <Text>{unitsImperial ? ' mi' : ' km'}</Text>
        </View>
      </View>

      {/* COMMON INTERESTS */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingLeft: 20 }}>
        <FlatList
          style={{ marginBottom: 4 }}
          horizontal={true}
          data={user.commonInterests}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Chip style={styles.marginRight4}>{item.text}</Chip>
          )}
        />
      </View>


      {/* DESCRIPTION */}
      {user.description && (
        <ScrollView>
          <Text style={styles.descriptionCardItem}>{user.description}</Text>
        </ScrollView>
      )}

      {/* ACTIONS */}
      <View style={styles.actionsCardItem}>
        <TouchableOpacity style={[styles.button, { backgroundColor: GRAY, marginRight: 24 }]} onPress={() => onhideUser()}>
          <Icon name="close" color={DISLIKE_ACTIONS} size={25} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => onLikeUser()}>
          <Icon name="heart" color={LIKE_ACTIONS} size={25} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CardItem;
