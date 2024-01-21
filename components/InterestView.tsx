import React from "react";
import { AlertModel, InterestModalT, UserInterest, UserInterestAutocomplete, UserInterestDto } from "../types";
import { Text, Button, IconButton, Searchbar } from 'react-native-paper';
import { Keyboard, View } from "react-native";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { debounce } from "lodash";
import Alert from "./Alert";

const InterestModal = ({ user, data, updateButtonText, setInterestsExternal }: InterestModalT) => {

  const MAX_INTERESTS = 5;
  const i18n = I18N.getI18n();

  const [interests, setInterests] = React.useState(data);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [interest, setInterest] = React.useState("");
  const [interestDebounce, setInterestDebounce] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [suggestionsList, setSuggestionsList] = React.useState(Array<UserInterestDto>);
  const [interestToBeDeleted, setInterestToBeDeleted] = React.useState<UserInterest | null>();

  const alertButtons = [
    {
      text: i18n.t('cancel'),
      onPress: () => { setAlertVisible(false); },
    },
    {
      text: i18n.t('ok'),
      onPress: async () => {
        if (interestToBeDeleted) {
          if(user) await Global.Fetch(Global.format(URL.USER_REMOVE_INTEREST, interestToBeDeleted.text), 'post');
          let interestsCopy = [...interests];
          interestsCopy.forEach((item, index) => {
            if (item === interestToBeDeleted) interestsCopy.splice(index, 1);
          });
          setInterests(interestsCopy);
          if(setInterestsExternal) setInterestsExternal(interestsCopy);
          setInterestToBeDeleted(null);
          setAlertVisible(false);
          if(user) user.interests = interestsCopy;
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
    if(setInterestsExternal) setInterestsExternal(data);
    if (updateButtonText) {
      updateButtonText(data);
    }
  }, [data]);

  React.useEffect(() => {
    if (updateButtonText) {
      updateButtonText(interests);
    }
  }, [interests]);

  React.useEffect(() => {
    if (interestToBeDeleted) {
      setAlertVisible(true);
    }
  }, [interestToBeDeleted]);

  async function getSuggestions() {
    let q = interestRef.current;
    let filterToken = cleanInterest(q);
    if (typeof q !== 'string' || q.length < 2) {
      setSuggestionsList([])
      return;
    }
    setLoading(true)
    const response = await Global.Fetch(Global.format(URL.USER_INTEREST_AUTOCOMPLETE, encodeURI(filterToken)));
    const items: Array<UserInterestAutocomplete> = response.data;
    const suggestions: Array<UserInterestDto> = items.map(item => {
      return { id: item.name, number: item.name + " (" + item.countString + ")" }
    });

    setSuggestionsList(suggestions)
    setLoading(false);
  };

  async function addInterest(interest: string) {
    if (interest) {
      interest = cleanInterest(interest);
      if(user) await Global.Fetch(Global.format(URL.USER_ADD_INTEREST, interest), 'post');
      let newInterest: UserInterest = { text: interest };
      const copy = [...interests];
      copy.push(newInterest);
      setInterests(copy);
      if(setInterestsExternal) setInterestsExternal(copy);
      setInterest("");
      Keyboard.dismiss();
      if(user) user.interests = copy;
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
      <Alert visible={alertVisible} setVisible={setAlertVisible} message={Global.format(i18n.t('profile.interest-alert-delete'), interestToBeDeleted?.text)} buttons={alertButtons} />
    </View>
  );
};

export default InterestModal;
