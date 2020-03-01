import { Alert, StyleSheet, TouchableOpacity } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  Icon,
  NavHeaderButtonText,
  Text,
  TextInput,
  View
} from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getAuthUserInfo } from '../state/actions/auth'
import { updateLoggedInUser } from '../state/actions/user'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading?: boolean
  name?: string
  selectedIsPublicKey?: boolean
}

export class EditProfileScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Edit Profile',
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('updateUser')}>
          <NavHeaderButtonText text='Save' />
        </TouchableOpacity>
      )
    }
  }

  constructor(props: Props) {
    super(props)
    const user = props.navigation.getParam('user')

    this.state = {
      isLoading: true,
      name: user.name,
      selectedIsPublicKey: user.isPublic
    }
  }

  async componentDidMount() {
    this.props.navigation.setParams({ updateUser: this._updateUser })
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })

    gaTrackPageView('/edit-profile', 'Edit Profile Screen')
  }

  _updateUser = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('update your profile')
    if (wasAlerted) return

    this.setState(
      {
        isLoading: true
      },
      async () => {
        try {
          const { name, selectedIsPublicKey } = this.state
          const { id } = this.global.session.userInfo
          await updateLoggedInUser(
            {
              id,
              isPublic: selectedIsPublicKey,
              name
            },
            this.global
          )
          this.props.navigation.goBack(null)
        } catch (error) {
          if (error.response) {
            Alert.alert(
              PV.Alerts.SOMETHING_WENT_WRONG.title,
              PV.Alerts.SOMETHING_WENT_WRONG.message,
              PV.Alerts.BUTTONS.OK
            )
          }
        }
        this.setState({ isLoading: false })
      }
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _onChangeIsPublic = (key: boolean) => {
    this.setState({ selectedIsPublicKey: key })
  }

  _onChangeName = (text: string) => {
    this.setState({ name: text })
  }

  render() {
    const user = this.props.navigation.getParam('user')
    const { globalTheme } = this.global
    const { isLoading, name, selectedIsPublicKey } = this.state
    const selectedIsPublicOption =
      isPublicOptions.find((x) => x.value === selectedIsPublicKey) ||
      selectPlaceholder
    let privacySubtitleVerbTenseText = 'will be'

    if (user.isPublic && user.isPublic === selectedIsPublicKey) {
      privacySubtitleVerbTenseText = 'are'
    } else if (!user.isPublic && user.isPublic === selectedIsPublicKey) {
      privacySubtitleVerbTenseText = 'is'
    }

    return (
      <View style={styles.view}>
        {!isLoading ? (
          <View>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={core.textInputLabel}>
              Name
            </Text>
            <TextInput
              autoCapitalize='none'
              autoCompleteType='off'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this._onChangeName}
              placeholder='your name'
              returnKeyType='done'
              style={[styles.textInput, globalTheme.textInput]}
              underlineColorAndroid='transparent'
              value={name}
            />
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={core.textInputLabel}>
              Profile Privacy
            </Text>
            <RNPickerSelect
              items={isPublicOptions}
              onValueChange={this._onChangeIsPublic}
              placeholder={selectPlaceholder}
              value={selectedIsPublicKey}>
              <View style={[core.selectorWrapper, globalTheme.textInput]}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={core.selectorText}>
                  {selectedIsPublicOption.label}
                </Text>
                <Icon
                  name='angle-down'
                  size={14}
                  style={[core.selectorIcon, globalTheme.textInputIcon]}
                />
              </View>

              {selectedIsPublicKey && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  style={[core.textInputSubTitle, globalTheme.textSecondary]}>
                  {`Podcasts, clips, and playlists ${privacySubtitleVerbTenseText} visible on your profile page.`}
                </Text>
              )}
              {selectedIsPublicKey === false && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  style={[core.textInputSubTitle, globalTheme.textSecondary]}>
                  {`Your profile page ${privacySubtitleVerbTenseText} hidden. Your clip and playlist links ${
                    privacySubtitleVerbTenseText === 'is'
                      ? 'are'
                      : privacySubtitleVerbTenseText
                  } still accessible to anyone with the links.`}
                </Text>
              )}
            </RNPickerSelect>
          </View>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    )
  }
}

const selectPlaceholder = {
  label: 'Select...',
  value: null
}

const isPublicOptions = [
  {
    label: 'Public',
    value: true
  },
  {
    label: 'Private',
    value: false
  }
]

const styles = StyleSheet.create({
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16
  },
  view: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16
  }
})
