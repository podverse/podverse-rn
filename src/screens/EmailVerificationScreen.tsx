import React from 'reactn'
import { MessageWithAction } from '../components'
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

  _sendVerificationEmail = async () => {
    const { email } = this.state
    sendVerificationEmail(email)
  }

  render() {
    const { isResendingEmail } = this.state

    return (
      <MessageWithAction
        actionHandler={this._sendVerificationEmail}
        actionText="Resend Verification Email"
        isLoading={isResendingEmail}
        message="Please verify your email address to login. You should receive an email shortly."
      />
    )
  }
}
