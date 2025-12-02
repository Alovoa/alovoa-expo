import React from "react";
import { InterestModalT, UserInterest, UserInterestAutocomplete, UserInterestDto } from "../myTypes";
import { Text, Button, Searchbar } from 'react-native-paper';
import { Keyboard, View, useWindowDimensions } from "react-native";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { debounce } from "lodash";
import { ScrollView } from "react-native-gesture-handler";

const InterestModal = ({ user, data, updateButtonText, setInterestsExternal }: InterestModalT) => {

  const i18n = I18N.getI18n();
  const { height } = useWindowDimensions();

  const [interests, setInterests] = React.useState(data);
  const [interest, setInterest] = React.useState("");
  const [interestDebounce, setInterestDebounce] = React.useState("");
  // const [loading, setLoading] = React.useState(false);
  const [suggestionsList, setSuggestionsList] = React.useState(Array<UserInterestDto>);

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
    if (setInterestsExternal) setInterestsExternal(data);
    if (updateButtonText) {
      updateButtonText(data);
    }
  }, [data]);

  React.useEffect(() => {
    if (updateButtonText) {
      updateButtonText(interests);
    }
  }, [interests]);

  async function getSuggestions() {
    let q = interestRef.current;
    let filterToken = cleanInterest(q);
    if (typeof q !== 'string' || q.length < 2) {
      setSuggestionsList([])
      return;
    }
    // setLoading(true)
    const response = await Global.Fetch(Global.format(URL.USER_INTEREST_AUTOCOMPLETE, encodeURI(filterToken)));
    const items: UserInterestAutocomplete[] = response.data;
    const suggestions: UserInterestDto[] = items.map(item => {
      return { id: item.name, number: item.name + " (" + item.countString + ")" }
    });

    setSuggestionsList(suggestions)
    // setLoading(false);
  };

  async function addInterest(interest: string) {
    if (interest) {
      interest = cleanInterest(interest);
      if (user) await Global.Fetch(Global.format(URL.USER_ADD_INTEREST, interest), 'post');
      let newInterest: UserInterest = { text: interest };
      const copy = [...interests];
      copy.push(newInterest);
      setInterests(copy);
      if (setInterestsExternal) setInterestsExternal(copy);
      setInterest("");
      Keyboard.dismiss();
      if (user) user.interests = copy;
    }
  }

  async function removeInterest(interest: UserInterest, index: number) {
    if (user) await Global.Fetch(Global.format(URL.USER_REMOVE_INTEREST, interest.text), 'post');
    let interestsCopy = [...interests];
    interestsCopy.splice(index, 1);
    setInterests(interestsCopy);
    if (setInterestsExternal) setInterestsExternal(interestsCopy);
    if (user) user.interests = interestsCopy;
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
        {interests.length < Global.MAX_INTERESTS &&
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
        {suggestionsList?.length === 0 && <Text style={{ marginBottom: 8 }}>{i18n.t('profile.onboarding.interests')}</Text>}
        <ScrollView style={{ maxHeight: height > 500 ? 240 : 80 }}>
          {suggestionsList?.length === 0 &&
            interests.map((item, index) => (
              <Button key={index} onPress={() => { removeInterest(item, index) }} icon="close-circle" mode="elevated" style={{ marginRight: 8, marginBottom: 8 }}>
                <Text>{item.text}</Text>
              </Button>
            ))
          }
        </ScrollView>
      </View>
    </View>
  );
};

export default InterestModal;
