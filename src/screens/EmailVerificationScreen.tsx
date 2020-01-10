import React from 'reactn'
import { MessageWithAction } from '../components'
import { PV } from '../resources'
import { sendVerificationEmail } from '../services/auth'

type Props = {
  navigation: any
}

type State = {
  email?: string
  isResendingEmail?: boolean
}

export class EmailVerificationScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Verify Your Email'
  }

  constructor(props: Props) {
    super(props)

    const email = props.navigation.getParam('email')
    this.state = {
      email,
      isResendingEmail: false
    }
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
        bottomActionText='Login'
        isLoading={isResendingEmail}
        message='Please verify your email address to login. You should receive an email shortly. The email may go to your Spam folder.'
        topActionHandler={this._sendVerificationEmail}
        topActionText='Resend Verification Email'
      />
    )
  }
}
