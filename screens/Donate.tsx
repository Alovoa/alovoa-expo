import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  useWindowDimensions
} from "react-native";

import { Text, Button, Menu, ActivityIndicator, MaterialBottomTabScreenProps } from "react-native-paper";
import { CardItemDonate } from "../components";
import styles, { STATUS_BAR_HEIGHT } from "../assets/styles";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { DonationDtoListModel, DonationDto, RootStackParamList } from "../types";
import * as Linking from 'expo-linking';

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Donate'>
const Donate = ({}: Props) => {

  const FILTER_RECENT = 1;
  const FILTER_AMOUNT = 2;
  const topBarHeight = 62;

  const i18n = I18N.getI18n();
  const { height, width } = useWindowDimensions();

  const [refreshing, setRefreshing] = React.useState(false);
  const [results, setResults] = React.useState(Array<DonationDto>);
  const [filter, setFilter] = React.useState(FILTER_RECENT);
  const [loading, setLoading] = React.useState(false);

  const [menuSortVisible, setMenuSortVisible] = React.useState(false);

  const showMenuSort = () => setMenuSortVisible(true);
  const hideMenuSort = () => setMenuSortVisible(false);

  async function load() {
    setLoading(true);
    let response = await Global.Fetch(Global.format(URL.API_DONATE_RECENT, filter));
    let data: DonationDtoListModel = response.data;
    setResults(data.list);
    setLoading(false);
  }

  function updateFilter(num: number) {
    if (num != filter) {
      setFilter(num);
    }
    hideMenuSort();
  }

  React.useEffect(() => {
    load();
  }, [filter]);

  React.useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, height: height }}>
      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }
      <View style={{ paddingTop: STATUS_BAR_HEIGHT }}></View>
      <View style={[styles.top, { paddingBottom: 8, justifyContent: 'flex-end' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {Global.FLAG_FDROID &&
            <Button icon="cash-multiple" mode="contained-tonal" onPress={() => Linking.openURL(URL.DONATE_LIST)} style={{ marginRight: 4 }}>
              <Text>{i18n.t('navigation.donate')}</Text>
            </Button>}
          <View>
            <Menu
              visible={menuSortVisible}
              onDismiss={hideMenuSort}
              anchor={<Button icon="sort" mode="contained-tonal" onPress={() => showMenuSort()}>
                <Text>{i18n.t('sort')}</Text>
              </Button>}>
              <Menu.Item leadingIcon="sort-clock-ascending-outline" onPress={() => { updateFilter(FILTER_RECENT) }} title={i18n.t('donate.filter.recent')} />
              <Menu.Item leadingIcon="sort-numeric-descending-variant" onPress={() => { updateFilter(FILTER_AMOUNT) }} title={i18n.t('donate.filter.amount')} />
            </Menu>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          columnWrapperStyle={{ flex: 1, justifyContent: "space-around" }}
          numColumns={2}
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <CardItemDonate
                user={item.user}
                donation={item.amount}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
};

export default Donate;
