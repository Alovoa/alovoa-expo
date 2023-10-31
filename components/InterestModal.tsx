import React from "react";
import { AlertModel, InterestModalT, UserInterest, UserInterestAutocomplete, UserInterestDto } from "../types";
import { Modal, Portal, Text, Button, useTheme, IconButton, TextInput, Searchbar } from 'react-native-paper';
import { Keyboard, View, useWindowDimensions } from "react-native";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { debounce } from "lodash";
import Alert from "./Alert";
import { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";

const InterestModal = ({ user, data }: InterestModalT) => {

  const MAX_INTERESTS = 5;
  const i18n = I18N.getI18n();
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();

  const [interests, setInterests] = React.useState(data);
  const [buttonText, setButtonText] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [interest, setInterest] = React.useState("");
  const [interestDebounce, setInterestDebounce] = React.useState("");
  const [suggestionsList, setSuggestionsList] = React.useState(Array<UserInterestDto>);
  const [loading, setLoading] = React.useState(false);
  const [interestToBeDeleted, setInterestToBeDeleted] = React.useState<UserInterest | null>();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: colors.background, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  const alertButtons = [
    {
      text: i18n.t('cancel'),
      onPress: () => { setAlertVisible(false); },
    },
    {
      text: i18n.t('ok'),
      onPress: async () => {
        if (interestToBeDeleted) {
          await Global.Fetch(Global.format(URL.USER_REMOVE_INTEREST, interestToBeDeleted.text), 'post');
          let interestsCopy = [...interests];
          interestsCopy.forEach((item, index) => {
            if (item === interestToBeDeleted) interestsCopy.splice(index, 1);
          });
          setInterests(interestsCopy);
          setInterestToBeDeleted(null);
          setAlertVisible(false);
          user.interests = interestsCopy;
        }
      }
    }
  ]

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

  React.useEffect(() => {
    if (interestToBeDeleted) {
      setAlertVisible(true);
    }
  }, [interestToBeDeleted]);

  function updateButtonText() {
    let text = interests.map(item => item.text).join(", ");
    if(!text) {
      text = Global.EMPTY_STRING;
    }
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
      user.interests = copy;
    }
  }

  async function removeInterest(interest: UserInterest) {
    setInterestToBeDeleted(interest);
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
                style={{ marginBottom: 18 }}
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
      <Alert visible={alertVisible} setVisible={setAlertVisible} message={Global.format(i18n.t('profile.interest-alert-delete'), interestToBeDeleted?.text)} buttons={alertButtons} />
      <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.onboarding.interests')}</Text>
      <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
        style={{ alignSelf: 'stretch' }} onPress={showModal}>{buttonText}</Button>
    </View>
  );
};

export default InterestModal;
