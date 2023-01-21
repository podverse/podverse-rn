/* eslint-disable max-len */
import { Alert, StyleSheet } from 'react-native'
import React from 'reactn'
import { Button, Divider, Icon, PVDialog, ScrollView, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { getMembershipExpiration } from '../lib/membership'
import { downloadMyUserDataFile } from '../lib/storage'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { deleteLoggedInUser } from '../services/user'
import { logoutUser } from '../state/actions/auth'
import { button, core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  deleteAccountDialogText: string
  deleteAccountDialogConfirmed?: boolean
  showDeleteAccountDialog?: boolean
}

const testIDPrefix = 'settings_screen_account'

export class SettingsScreenAccount extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      deleteAccountDialogText: ''
    }
  }

  static navigationOptions = () => ({
    title: translate('Account')
  })

  componentDidMount() {
    trackPageView('/settings-account', 'Settings Screen Account')
  }

  _handleEditProfilePress = () => {
    const { user } = this.global.profile
    this.props.navigation.navigate(PV.RouteNames.EditProfileScreen, { user })
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
      deleteAccountDialogConfirmed: !!text && text.toUpperCase() === translate('DELETE').toUpperCase(),
      deleteAccountDialogText: text
    })
  }

  _handleDeleteAccount = async () => {
    const { navigation } = this.props
    const { deleteAccountDialogText } = this.state

    try {
      if (deleteAccountDialogText && deleteAccountDialogText.toUpperCase() === translate('DELETE').toUpperCase()) {
        await deleteLoggedInUser()
        await logoutUser()
        this.setState({ showDeleteAccountDialog: false })
        navigation.goBack(null)
        navigation.goBack(null)
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
    const { session } = this.global
    const { userInfo } = session
    const { deleteAccountDialogConfirmed, deleteAccountDialogText, showDeleteAccountDialog } = this.state

    const privacyText = !session?.userInfo?.isPublic
      ? translate('Your profile page is hidden')
      : translate('Your profile page is public')

    const editIcon = (
      <Icon
        accessibilityHint={translate('ARIA HINT - go to the edit my profile screen')}
        accessibilityLabel={translate('Edit My Profile')}
        name='pencil-alt'
        onPress={this._handleEditProfilePress}
        size={26}
        style={button.iconOnlyMedium}
      />
    )

    const membershipExpirationLabelText = !!userInfo?.membershipExpiration
      ? translate('Premium membership expiration date')
      : translate('Free trial expiration date')
    const expirationDate = getMembershipExpiration(userInfo)

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={styles.itemWrapper}>
          <Text style={styles.label}>{translate('Email')}</Text>
          <Text style={styles.text}>{session?.userInfo?.email}</Text>
        </View>
        <View style={styles.rowWrapper}>
          <View style={styles.innerWrapper}>
            <Text style={styles.label}>{translate('Name')}</Text>
            <Text style={styles.text}>{session?.userInfo?.name || translate('Anonymous')}</Text>
          </View>
          {editIcon}
        </View>
        <View style={styles.rowWrapper}>
          <View style={styles.innerWrapper}>
            <Text style={styles.label}>{translate('Privacy')}</Text>
            <Text style={styles.smallText}>{privacyText}</Text>
          </View>
          {editIcon}
        </View>
        <View style={styles.itemWrapper}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.label} testID={`${testIDPrefix}_expires`}>
            {membershipExpirationLabelText}
          </Text>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={styles.text}
            testID={`${testIDPrefix}_expiration_date`}>
            {readableDate(expirationDate)}
          </Text>
        </View>
        <Divider style={styles.divider} />
        <Button
          accessibilityLabel={translate('Download my data')}
          isPrimary
          onPress={downloadMyUserDataFile}
          testID={`${testIDPrefix}_download_my_data`}
          text={translate('Download my data')}
          wrapperStyles={core.button}
        />
        <Text style={styles.buttonExplanation}>{translate('Download my data explanation')}</Text>
        <Divider style={styles.divider} />
        <Button
          accessibilityLabel={translate('Delete Account')}
          isWarning
          onPress={this._handleToggleDeleteAccountDialog}
          testID={`${testIDPrefix}_delete_account`}
          text={translate('Delete Account')}
          wrapperStyles={core.button}
        />
        <PVDialog
          buttonProps={[
            {
              label: translate('Cancel'),
              onPress: this._handleToggleDeleteAccountDialog,
              testID: `${testIDPrefix}_dialog_delete_account_cancel`.prependTestId()
            },
            {
              bold: deleteAccountDialogConfirmed,
              color: deleteAccountDialogConfirmed ? PV.Colors.redLighter : PV.Colors.gray,
              disabled: !deleteAccountDialogConfirmed,
              label: translate('Delete'),
              onPress: this._handleDeleteAccount,
              testID: `${testIDPrefix}_dialog_delete_account_delete`.prependTestId()
            }
          ]}
          descriptionProps={[
            {
              children: translate('Are you sure you want to delete your account'),
              testID: `${testIDPrefix}_dialog_delete_account_description_1`.prependTestId()
            },
            {
              children: translate('Type DELETE in the input below to confirm'),
              testID: `${testIDPrefix}_dialog_delete_account_description_2`.prependTestId()
            }
          ]}
          inputProps={[
            {
              onChangeText: this._handleDeleteAccountDialogTextChange,
              placeholder: '',
              testID: `${testIDPrefix}_dialog_delete_account_input`.prependTestId(),
              value: deleteAccountDialogText
            }
          ]}
          title={translate('Delete Account')}
          visible={showDeleteAccountDialog}
        />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  buttonExplanation: {
    fontSize: PV.Fonts.sizes.md,
    paddingHorizontal: 12
  },
  divider: {
    marginTop: 32,
    marginBottom: 40
  },
  innerWrapper: {
    flex: 1
  },
  itemWrapper: {
    marginBottom: 16
  },
  label: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 4
  },
  rowWrapper: {
    flexDirection: 'row',
    marginBottom: 16
  },
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  smallText: {
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 4
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 4
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
