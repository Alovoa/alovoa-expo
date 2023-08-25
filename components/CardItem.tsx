import React from "react";
import { View, Image, Dimensions, TouchableOpacity, StyleProp, TextStyle, FlatList, ScrollView } from "react-native";
import { useTheme, Text, Chip } from "react-native-paper";
import Icon from "./Icon";
import { CardItemT } from "../types";
import * as Global from "../Global";
import styles, {
  DISLIKE_ACTIONS,
  LIKE_ACTIONS,
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
  const fullHeight = Dimensions.get("window").height;
  const descriptionHeight = fullHeight - 597;
  const descriptionHeightNoCommonInterest = fullHeight - 566;

  const imageStyle = [
    {
      borderRadius: 8,
      width: hasVariant ? fullWidth / 2 - 30 : fullWidth - 30,
      height: hasVariant ? fullWidth / 2 - 30 : fullWidth - 30,
      marginTop: hasVariant ? 0 : 26,
      marginBottom: hasVariant ? 0 : 4,
    },
  ];

  const nameStyle: StyleProp<TextStyle> = [
    {
      paddingTop: hasVariant ? 10 : 4,
      paddingBottom: hasVariant ? 5 : 7,
      fontSize: hasVariant ? 15 : 20,
      textAlign: hasVariant && !hasDonation ? 'center' : 'auto',
      textAlignVertical: 'center'
    },
  ];

  const cardVariant = hasVariant ? {
    width: 150, paddingBottom: 4
  } : {}


  function onLikeUser() {
    swiper.current?.swipeRight();
  }

  function onhideUser() {
    swiper.current?.swipeLeft();
  }

  return (
    <View style={[styles.containerCardItem, cardVariant, { backgroundColor: colors.background }]}>
      {/* IMAGE */}
      <TouchableOpacity onPress={() => Global.nagivateProfile(user)}>
        <Image source={{ uri: user.profilePicture }} style={imageStyle} />
      </TouchableOpacity>

      {/* NAME */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: hasVariant ? 4 : 20 }}>
        <View style={{ flexDirection: 'row' }}><Text style={nameStyle}>{user.firstName + ", " + user.age}</Text>
          {!hasVariant && user.lastActiveState <= 2 && <MaterialCommunityIcons name="circle" size={14} color={"#64DD17"} style={{ padding: 6, paddingTop: 7 }} />}
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
        <ScrollView style={{ height: user.commonInterests.length != 0 ? descriptionHeight : descriptionHeightNoCommonInterest }}>
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
