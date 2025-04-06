import React from "react";
import { Text, View } from "react-native";
import Icon from "./Icon";
import styles from "../assets/styles";
import { TabBarIconT } from "../types";
import { useTheme } from "react-native-paper";

const TabBarIcon = ({ focused, iconName, text }: TabBarIconT) => {
  const { colors } = useTheme();
  const iconFocused = focused ? colors.primary : '#9e9e9e';

  return (
    <View style={styles.iconMenu}>
      <Icon name={iconName} size={16} color={iconFocused} />
      <Text style={[styles.tabButtonText, { color: iconFocused }]}>{text}</Text>
    </View>
  );
};

export default TabBarIcon;
