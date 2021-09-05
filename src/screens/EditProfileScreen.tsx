import { Alert, StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  DropdownButtonSelect,
  NavHeaderButtonText,
  TextInput,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { getAuthUserInfo } from '../state/actions/auth'
import { updateLoggedInUser } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  isLoading?: boolean
  name?: string
  selectedIsPublicKey?: boolean
}

const testIDPrefix = 'edit_profile_screen'

export class EditProfileScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const user = props.navigation.getParam('user')

    this.state = {
      isLoading: true,
      name: user.name,
      selectedIsPublicKey: user.isPublic
    }
  }

  static navigationOptions = ({ navigation }) => ({
      title: translate('Edit My Profile'),
      headerRight: () => (
        <NavHeaderButtonText
          accessibilityHint={translate('ARIA HINT - save these changes to your profile')}
          accessibilityLabel={translate('Save')}
          handlePress={navigation.getParam('updateUser')}
          testID={testIDPrefix}
          text={translate('Save')}
        />
      )
    })

  async componentDidMount() {
    this.props.navigation.setParams({ updateUser: this._updateUser })
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })

    trackPageView('/edit-profile', 'Edit My Profile Screen')
  }

  _updateUser = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('update your profile')
    if (wasAlerted) return

    this.setState(
      {
        isLoading: true
      },
      () => {
        (async () => {
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
        })()
      }
    )
  }

  _ItemSeparatorComponent = () => <Divider />

  _onChangeIsPublic = (key: boolean) => {
    this.setState({ selectedIsPublicKey: key })
  }

  _onChangeName = (text: string) => {
    this.setState({ name: text })
  }

  render() {
    const user = this.props.navigation.getParam('user')
    const { isLoading, name, selectedIsPublicKey } = this.state
    const selectedIsPublicOption = isPublicOptions.find((x) => x.value === selectedIsPublicKey) || selectPlaceholder
    const willBeDifferent = user.isPublic !== selectedIsPublicKey

    let helpText = ''
    if (selectedIsPublicKey) {
      helpText = willBeDifferent
        ? translate('Podcasts clips and playlists will be visible')
        : translate('Podcasts clips and playlists are visible')
    } else if (selectedIsPublicKey === false) {
      helpText = willBeDifferent
        ? translate('Your profile page will be hidden')
        : translate('Your profile page is hidden')
    }

    return (
      <View
        style={styles.view}
        testID='edit_profile_screen_view'>
        {!isLoading ? (
          <>
            <TextInput
              accessibilityHint={translate('ARIA HINT - This is your profile name edit')}
              autoCapitalize='none'
              autoCompleteType='off'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this._onChangeName}
              placeholder={translate('Name')}
              returnKeyType='done'
              style={styles.textInput}
              underlineColorAndroid='transparent'
              testID={`${testIDPrefix}_name`}
              value={name}
            />
            <DropdownButtonSelect
              accessibilityHint={selectedIsPublicOption.label}
              helpText={helpText}
              items={isPublicOptions}
              label={selectedIsPublicOption.label}
              onValueChange={this._onChangeIsPublic}
              testID={`${testIDPrefix}_picker_select_privacy`}
              value={selectedIsPublicKey}
              wrapperStyle={styles.dropdownButtonSelectWrapper}
            />
          </>
        ) : (
          <ActivityIndicator fillSpace testID={testIDPrefix} />
        )}
      </View>
    )
  }
}

const selectPlaceholder = {
  label: translate('Select'),
  value: null
}

const isPublicOptions = [
  {
    label: translate('Public'),
    value: true
  },
  {
    label: translate('Private'),
    value: false
  }
]

const styles = StyleSheet.create({
  dropdownButtonSelectWrapper: {},
  textInput: {},
  textInputSubtext: {
    marginTop: 16
  },
  view: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16
  }
})
