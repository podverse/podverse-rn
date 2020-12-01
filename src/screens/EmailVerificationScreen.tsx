import React from 'reactn'
import { MessageWithAction } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { sendVerificationEmail } from '../services/auth'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation: any
}

type State = {
  email?: string
  isResendingEmail?: boolean
}

export class EmailVerificationScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Verify Your Email')
    }
  }

  constructor(props: Props) {
    super(props)

    const email = props.navigation.getParam('email')
    this.state = {
      email,
      isResendingEmail: false
    }
  }

  componentDidMount() {
    trackPageView('/email-verification', 'Email Verification Screen')
  }

  _navToLogin = async () => {
    const { navigation } = this.props
    await navigation.goBack(null)
    await navigation.goBack(null)
    await navigation.goBack(null)
    await navigation.navigate(PV.RouteNames.AuthNavigator)
  }

  _sendVerificationEmail = async () => {
    const { email } = this.state
    if (email) {
      sendVerificationEmail(email)
    }
  }

  render() {
    const { isResendingEmail } = this.state

    return (
      <MessageWithAction
        bottomActionHandler={this._navToLogin}
        bottomActionText={translate('Login')}
        isLoading={isResendingEmail}
        message={`${translate('Please verify your email address to login')} 
        ${translate('You should receive an email shortly The email may go to your Spam folder')}`}
        topActionHandler={this._sendVerificationEmail}
        topActionText={translate('Resend Verification Email')}
      />
    )
  }
}
