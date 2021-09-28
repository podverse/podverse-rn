/* eslint-disable max-len */
import { Alert, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import React from 'reactn'
import {
  Button,
  ScrollView
} from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { deleteLoggedInUser } from '../services/user'
import { logoutUser } from '../state/actions/auth'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  deleteAccountDialogText: string
  deleteAccountDialogConfirmed?: boolean
  showDeleteAccountDialog?: boolean
}

const testIDPrefix = 'settings_screen_advanced'

export class SettingsScreenAccount extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      deleteAccountDialogText: '',
    }
  }

  static navigationOptions = () => ({
    title: translate('Account')
  })

  componentDidMount() {
    trackPageView('/settings-account', 'Settings Screen Account')
  }

  _handleToggleDeleteAccountDialog = () => {
    this.setState({
      deleteAccountDialogText: '',
      deleteAccountDialogConfirmed: false,
      showDeleteAccountDialog: !this.state.showDeleteAccountDialog
    })
  }

  _handleDeleteAccountDialogTextChange = (text: string) => {
    this.setState({
      deleteAccountDialogConfirmed: !!text && text.toUpperCase() === translate('DELETE'),
      deleteAccountDialogText: text
    })
  }

  _handleDeleteAccount = async () => {
    const { deleteAccountDialogText } = this.state

    try {
      if (deleteAccountDialogText && deleteAccountDialogText.toUpperCase() === translate('DELETE')) {
        await deleteLoggedInUser()
        await logoutUser()
        this.setState({ showDeleteAccountDialog: false })
      }
    } catch (error) {
      this.setState({ showDeleteAccountDialog: false }, () => {
        setTimeout(() => {
          Alert.alert(
            PV.Alerts.SOMETHING_WENT_WRONG.title,
            PV.Alerts.SOMETHING_WENT_WRONG.message,
            PV.Alerts.BUTTONS.OK
          )
        }, 1500)
      })
    }
  }

  render() {
    const { deleteAccountDialogConfirmed, deleteAccountDialogText, showDeleteAccountDialog } = this.state

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <Button
          accessibilityLabel={translate('Delete Account')}
          isWarning
          onPress={this._handleToggleDeleteAccountDialog}
          testID={`${testIDPrefix}_delete_account`}
          text={translate('Delete Account')}
          wrapperStyles={core.button}
        />
        <Dialog.Container visible={showDeleteAccountDialog}>
          <Dialog.Title>{translate('Delete Account')}</Dialog.Title>
          <Dialog.Description>{translate('Are you sure you want to delete your account')}</Dialog.Description>
          <Dialog.Description>{translate('Type DELETE in the input below to confirm')}</Dialog.Description>
          <Dialog.Input
            onChangeText={this._handleDeleteAccountDialogTextChange}
            placeholder=''
            {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_delete_account_input`.prependTestId() } : {})}
            value={deleteAccountDialogText}
          />
          <Dialog.Button
            label={translate('Cancel')}
            onPress={this._handleToggleDeleteAccountDialog}
            {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_delete_account_cancel`.prependTestId() } : {})}
          />
          <Dialog.Button
            bold={deleteAccountDialogConfirmed}
            color={deleteAccountDialogConfirmed ? PV.Colors.redDarker : PV.Colors.grayDark}
            disabled={!deleteAccountDialogConfirmed}
            label={translate('Delete')}
            onPress={this._handleDeleteAccount}
            {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_delete_account_delete`.prependTestId() } : {})}
          />
        </Dialog.Container>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
