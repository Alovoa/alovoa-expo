import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import styles from "../../assets/styles";
import { YourProfileResource } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import VerticalView from "../../components/VerticalView";


const i18n = I18N.getI18n();

const AdvancedSettings = ({ route, navigation }) => {

  var data: YourProfileResource = route.params.data;

  const { height, width } = useWindowDimensions();

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    
  }

  return (
    <View style={{ height: height, width: '100%' }}>
      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
          <View style={{ marginTop: 12 }}>
            
          </View>
        </View>
      </VerticalView>
    </View>
  );
};

export default AdvancedSettings;
