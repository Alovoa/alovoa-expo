import React from "react";
import { InterestModalT, UserInterest, UserInterestAutocomplete, UserInterestDto } from "../types";
import { Modal, Portal, Text, Button, useTheme, IconButton, TextInput, Searchbar } from 'react-native-paper';
import { Alert, Keyboard, View } from "react-native";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { debounce } from "lodash";

const InterestModal = ({ data }: InterestModalT) => {

  const MAX_INTERESTS = 5;
  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const [interests, setInterests] = React.useState(data);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [interest, setInterest] = React.useState("");
  const [interestDebounce, setInterestDebounce] = React.useState("");
  const [suggestionsList, setSuggestionsList] = React.useState(Array<UserInterestDto>);
  const [loading, setLoading] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: 12, borderRadius: 8, height: 3000 };

  const interestRef = React.useRef(interestDebounce);
  const debounceInterestHandler = React.useCallback(debounce(getSuggestions, 700), []);

  React.useEffect(() => {
    interestRef.current = interestDebounce;
    debounceInterestHandler();
  }, [interestDebounce]);

  React.useEffect(() => {
    setInterestDebounce(interest);
  }, [interest]);

  React.useEffect(() => {
    setInterests(data);
    updateButtonText();
  }, [data]);

  React.useEffect(() => {
    updateButtonText();
  }, [interests]);

  function updateButtonText() {
    let text = interests.map(item => item.text).join(", ");
    setButtonText(text);
  }

  async function getSuggestions() {
    let q = interestRef.current;
    let filterToken = cleanInterest(q);
    if (typeof q !== 'string' || q.length < 2) {
      setSuggestionsList([])
      return;
    }
    setLoading(true)
    const response = await Global.Fetch(Global.format(URL.USER_INTEREST_AUTOCOMPLETE, encodeURI(filterToken)));
    const items: Array<UserInterestAutocomplete> = response.data
    const suggestions: Array<UserInterestDto> = items.map(item => {
      return { id: item.name, number: item.name + " (" + item.countString + ")" }
    });

    setSuggestionsList(suggestions)
    setLoading(false);
  };

  async function addInterest(interest: string) {
    if (interest) {
      interest = cleanInterest(interest);
      await Global.Fetch(Global.format(URL.USER_ADD_INTEREST, interest), 'post');
      let newInterest: UserInterest = { text: interest };
      const copy = [...interests];
      copy.push(newInterest);
      setInterests(copy);
      setInterest("");
      Keyboard.dismiss();
    }
  }

  async function removeInterest(interest: UserInterest) {
    Alert.alert(i18n.t('profile.interest-alert.title'), Global.format(i18n.t('profile.interest-alert.subtitle'), interest.text), [
      {
        text: i18n.t('cancel'),
        onPress: () => { },
        style: 'cancel'
      },
      {
        text: i18n.t('ok'),
        onPress: async () => {
          await Global.Fetch(Global.format(URL.USER_REMOVE_INTEREST, interest.text), 'post');
          let interestsCopy = [...interests];
          interestsCopy.forEach((item, index) => {
            if (item === interest) interestsCopy.splice(index, 1);
          });
          setInterests(interestsCopy);
        }
      }
    ]);
  }

  function cleanInterest(txt: string) {
    let txtCopy = txt
    if (txtCopy) {
      txtCopy = txtCopy.replace(/ /g, "-");
      let text = txtCopy.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      return text;
    }
    return txt;
  }

  return (
    <View>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle} >
          <View>
            <IconButton
              style={{ alignSelf: 'flex-end' }}
              icon="close"
              size={20}
              onPress={hideModal}
            />
          </View>
          <View style={{ padding: 12 }}>

            {interests.length < MAX_INTERESTS &&
              <Searchbar
                placeholder={i18n.t('profile.interest')}
                value={interest}
                onChangeText={(text) => { setInterest(text) }}
                onSubmitEditing={() => addInterest(interest)}
                autoCorrect={false}
                style={{marginBottom: 18}}
              />
            }

            {
              suggestionsList.map((item, index) => (
                <Button key={index} onPress={() => { addInterest(item.id) }} mode="elevated" style={{ marginRight: 8, marginBottom: 8 }}>
                  <Text>{item.number}</Text>
                </Button>
              ))
            }

            {suggestionsList?.length == 0 && <Text style={{ marginBottom: 8 }}>{i18n.t('profile.onboarding.interests')}</Text>}
            {suggestionsList?.length == 0 &&
              interests.map((item, index) => (
                <Button key={index} onPress={() => { removeInterest(item) }} icon="close-circle" mode="elevated" style={{ marginRight: 8, marginBottom: 8 }}>
                  <Text>{item.text}</Text>
                </Button>
              ))
            }

          </View>
        </Modal>
      </Portal>
      <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.onboarding.interests')}</Text>
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default InterestModal;
