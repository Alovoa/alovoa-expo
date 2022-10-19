import React from "react";
import { View } from "react-native";
import { useTheme, Text, Card } from "react-native-paper";

const SIZE = 80
const CardItem = ({
  title,
  subtitle
}) => {
  const { colors } = useTheme();
  return (
    <View style={{ borderTopColor: colors.primary, borderTopWidth: 1, width: SIZE, height: SIZE, borderRadius: 4, marginRight: 8 }}>
      <Card style={{ width: SIZE, height: SIZE }}>
        <View style={{ justifyContent: 'center', flex: 1, alignSelf: 'center', padding: 6 }}>
          <Text style={{ fontSize: 12, textAlign: 'center', marginBottom: 6 }}>{title}</Text>
          <Text style={{ fontSize: 10, textAlign: 'center' }}>{subtitle}</Text>
        </View>
      </Card>
    </View>
  );
};

export default CardItem;
