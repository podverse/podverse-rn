import { ActivityIndicator, KeyboardAvoidingView, Modal, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Text, TextInput, View } from '../components'
import { translate } from '../lib/i18n'
import { navigateToPodcastScreenWithItem } from '../lib/navigate'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
import { addAddByRSSPodcastWithCredentials, clearAddByRSSPodcastAuthModalState } from '../state/actions/parser'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  isLoading: boolean
  password: string
  submitIsDisabled: boolean
  username: string
}

const testIDPrefix = 'add_by_rss_podcast_auth_modal'

export class AddByRSSPodcastAuthModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: false,
      password: '',
      submitIsDisabled: true,
      username: ''
    }
  }

  checkIfSubmitIsDisabled = () => {
    const submitIsDisabled = !this.state.username || !this.state.password
    this.setState({ submitIsDisabled })
  }

  handleDismiss = () => {
    this.setState({
      isLoading: false,
      password: '',
      submitIsDisabled: true,
      username: ''
    })
    clearAddByRSSPodcastAuthModalState()
  }

  login = () => {
    this.setState({ isLoading: true }, () => {
      (async () => {
        try {
          const { navigation } = this.props
          const { parser } = this.global
          const { feedUrl } = parser.addByRSSPodcastAuthModal
          const { password, username } = this.state
          const credentials = `${username}:${password}`
          const addByRSSSucceeded = await addAddByRSSPodcastWithCredentials(feedUrl, credentials)
          this.setState({ isLoading: false })
  
          if (addByRSSSucceeded) {
            const podcast = await getAddByRSSPodcastLocally(feedUrl)
            clearAddByRSSPodcastAuthModalState()
            navigateToPodcastScreenWithItem(navigation, podcast)
          }
        } catch (error) {
          console.log('_handleSavePodcastByRSSURL', error)
          this.setState({ isLoading: false })
        }
      })()
    })
  }

  usernameChanged = (username: string) => {
    this.setState({ username }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  passwordChanged = (password: string) => {
    this.setState({ password }, () => {
      this.checkIfSubmitIsDisabled()
    })
  }

  render() {
    const { fontScaleMode, parser } = this.global
    const { feedUrl } = parser.addByRSSPodcastAuthModal

    if (!feedUrl) return null

    const { isLoading, password, submitIsDisabled, username } = this.state
    const disabledStyle = submitIsDisabled ? { backgroundColor: PV.Colors.gray } : null
    const disabledTextStyle = submitIsDisabled ? { color: PV.Colors.white } : null

    const signInButtonTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.signInButtonText, disabledTextStyle, { fontSize: PV.Fonts.largeSizes.md }]
        : [styles.signInButtonText, disabledTextStyle]

    const switchOptionTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.switchOptionText, { fontSize: PV.Fonts.largeSizes.sm }]
        : [styles.switchOptionText]

    return (
      <Modal transparent>
        <View style={styles.view}>
          <KeyboardAvoidingView
            behavior='position'
            contentContainerStyle={styles.scrollViewContent}
            style={styles.scrollView}>
            <Text style={styles.headerText}>{translate('Login to Private Feed')}</Text>
            <Text style={styles.feedUrlText}>{feedUrl}</Text>
            <TextInput
              autoCapitalize='none'
              autoCompleteType='email'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this.usernameChanged}
              onSubmitEditing={() => {
                this.secondTextInput.focus()
              }}
              placeholder={translate('Username')}
              returnKeyType='next'
              testID={`${testIDPrefix}_username`}
              value={username}
              wrapperStyle={core.textInputWrapper}
            />
            <TextInput
              autoCapitalize='none'
              autoCompleteType='password'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this.passwordChanged}
              placeholder={translate('Password')}
              inputRef={(input) => {
                this.secondTextInput = input
              }}
              returnKeyType='done'
              secureTextEntry
              testID={`${testIDPrefix}_password`}
              value={password}
              underlineColorAndroid='transparent'
              wrapperStyle={core.textInputWrapper}
            />
            <TouchableOpacity activeOpacity={1}>
              <>
                <TouchableOpacity
                  style={[styles.signInButton, disabledStyle]}
                  disabled={submitIsDisabled || isLoading}
                  onPress={this.login}
                  {...testProps(`${testIDPrefix}_submit`)}>
                  {isLoading ? (
                    <ActivityIndicator animating color={PV.Colors.gray} size='small' />
                  ) : (
                    <Text style={signInButtonTextStyle}>{translate('Login')}</Text>
                  )}
                </TouchableOpacity>
              </>
            </TouchableOpacity>
            <Text
              key='cancel'
              onPress={this.handleDismiss}
              style={[switchOptionTextStyle, { marginTop: 0, width: '100%' }]}
              testID={`${testIDPrefix}_cancel`}>
              {translate('Cancel')}
            </Text>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  feedUrlText: {
    fontStyle: 'italic',
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 24
  },
  headerText: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 16
  },
  signInButton: {
    alignItems: 'center',
    backgroundColor: PV.Colors.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8
  },
  signInButtonText: {
    color: PV.Colors.brandColor,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: 'bold'
  },
  scrollView: {
    width: '90%'
  },
  scrollViewContent: {
    justifyContent: 'center'
  },
  switchOptionText: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 12,
    padding: 12,
    textAlign: 'center'
  }
})
