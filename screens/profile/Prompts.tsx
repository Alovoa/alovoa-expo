import React from "react";
import { WIDESCREEN_HORIZONTAL_MAX } from "../../assets/styles";
import { Portal, Text, useTheme, IconButton, Surface, TextInput } from 'react-native-paper';
import { KeyboardAvoidingView, Pressable, View, useWindowDimensions } from "react-native";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { RootStackParamList, UserDto, UserPrompt } from "../../myTypes";
import Alert from "../../components/Alert";
import { useHeaderHeight } from '@react-navigation/elements';
import VerticalView from "../../components/VerticalView";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import Modal from "react-native-modal";

type Props = BottomTabScreenProps<RootStackParamList, 'Profile.Prompts'>

const Prompts = ({ route }: Props) => {

  const routeUserPrompts = route.params.prompts;
  const updatePrompts = route.params.updatePrompts;

  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const i18n = I18N.getI18n();
  const maxPrompts = 6;
  const maxPromptAmount = 20;
  const maxPromptTextLength = 120;
  const promptIdArray = Array.from({ length: maxPromptAmount }, (v, k) => k + 1);;

  enum ModalModeE {
    ADD = 1,
    EDIT = 2,
    DELETE = 3
  }

  const [visible, setVisible] = React.useState(false);
  const [userPrompts, setUserPrompts] = React.useState(routeUserPrompts);
  const [prompts, setPrompts] = React.useState<Map<number, UserPrompt>>(new Map());
  const [modalId, setModalId] = React.useState(0);
  const [modalText, setModalText] = React.useState("");
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalMode, setModalMode] = React.useState<ModalModeE>(ModalModeE.ADD);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const containerStyle = { backgroundColor: colors.elevation.level3, padding: 24, marginHorizontal: calcMarginModal(), borderRadius: 8 };

  const alertButtons = [
    {
      text: i18n.t('cancel'),
      onPress: () => { setAlertVisible(false); },
    },
    {
      text: i18n.t('ok'),
      onPress: () => deletePrompt(modalId)
    }
  ]

  React.useEffect(() => {
    if (userPrompts) {
      let map = new Map(userPrompts.map((obj) => [obj.promptId, obj]));
      setPrompts(map);
    }
  }, [userPrompts]);

  React.useEffect(() => {
    updatePrompts([...prompts.values()]);
  }, [prompts]);

  function calcMarginModal() {
    return width < WIDESCREEN_HORIZONTAL_MAX + 12 ? 12 : width / 5 + 12;
  }

  function openModal(mode: ModalModeE, prompt: UserPrompt,) {
    setModalId(prompt.promptId);
    setModalText(prompt.text);
    setModalTitle(i18n.t('profile.prompts.' + prompt.promptId));
    setModalMode(mode);
    if (mode === ModalModeE.DELETE) {
      setAlertVisible(true);
    } else {
      showModal();
    }
  }

  async function addPrompt(prompt: UserPrompt) {
    let copy = new Map(prompts);
    copy.set(prompt.promptId, prompt);
    setPrompts(copy);
    setUserPrompts(Array.from(copy.values()));
    hideModal();
    await Global.Fetch(URL.USER_PROMPT_ADD, "post", prompt);
  }

  async function updatePrompt(prompt: UserPrompt) {
    let copy = new Map(prompts);
    copy.set(prompt.promptId, prompt);
    setPrompts(copy);
    setUserPrompts(Array.from(copy.values()));
    hideModal();
    await Global.Fetch(URL.USER_PROMPT_UPDATE, "post", prompt);
  }

  async function deletePrompt(promptId: number) {
    let copy = new Map(prompts);
    copy.delete(promptId);
    setPrompts(copy);
    setUserPrompts(Array.from(copy.values()));
    setAlertVisible(false);
    await Global.Fetch(Global.format(URL.USER_PROMPT_DELETE, promptId), "post");
  }

  function modalOkPressed() {
    let prompt = {} as UserPrompt;
    prompt.promptId = modalId;
    prompt.text = modalText;
    if (modalMode === ModalModeE.ADD) {
      addPrompt(prompt);
    }
    else if (modalMode === ModalModeE.EDIT) {
      updatePrompt(prompt);
    }
  }

  return (
    <View style={{ height: height - headerHeight }}>
      <Modal isVisible={visible}
        onDismiss={hideModal}
        onBackdropPress={hideModal}
        avoidKeyboard={false}>
        <KeyboardAvoidingView behavior="padding">
          <View style={containerStyle}>
            <Text style={{ fontSize: 20, marginBottom: 8, paddingHorizontal: 16 }}>{modalTitle}</Text>
            <TextInput style={{ backgroundColor: colors.elevation.level3 }}
              defaultValue={modalText}
              maxLength={maxPromptTextLength}
              autoCorrect={false}
              onChangeText={text => setModalText(text)}>
            </TextInput>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <IconButton
                icon="close"
                size={28}
                onPress={hideModal}
              />
              <IconButton
                icon="check"
                size={28}
                iconColor={colors.secondary}
                onPress={modalOkPressed}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <VerticalView>
        {[...prompts].map(([id, prompt]) => (
          <Surface key={id} style={{ padding: 24, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>{i18n.t('profile.prompts.' + id)}</Text>
            <Text style={{ marginBottom: 12, fontSize: 20 }}>{prompt.text}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <IconButton
                icon="delete"
                size={28}
                onPress={() => openModal(ModalModeE.DELETE, prompt)}
              />
              <IconButton
                icon="pencil"
                size={28}
                iconColor={colors.primary}
                onPress={() => openModal(ModalModeE.EDIT, prompt)}
              />
            </View>
          </Surface>
        ))}
        {
          prompts.size < maxPrompts &&
          <Text style={{ fontSize: 20, marginBottom: 18, marginTop: 26 }}>{i18n.t('profile.prompts.add')}</Text>
        }
        {
          prompts.size < maxPrompts && promptIdArray.filter(index => !prompts.has(index)).map(index => (
            <Pressable key={index} onPress={() => {
              openModal(ModalModeE.ADD, { promptId: index, text: "" });
            }}>
              <Surface style={{ padding: 24, borderRadius: 12, marginBottom: 8 }}>
                <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>{i18n.t('profile.prompts.' + (index)) + '…'}</Text>
              </Surface>
            </Pressable>
          ))
        }
      </VerticalView>
      <Alert visible={alertVisible} setVisible={setAlertVisible} message={i18n.t('profile.prompts.delete')} buttons={alertButtons} />
    </View>
  );
};

export default Prompts;
