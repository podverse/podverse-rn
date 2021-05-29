import { Platform } from 'react-native'
import Config from 'react-native-config'

export const Emails = {
  CONTACT_US: {
    email: Config.CONTACT_US_EMAIL,
    subject: 'Contact Podverse',
    body:
      `Platform: ${Platform.OS}` +
      'If you are reporting an issue, please provide your device type and/or brand ' +
      'and steps to reproduce the bug if possible. Thank you!' 
  },
  CHECKOUT_ISSUE: {
    email: Config.SUPPORT_EMAIL,
    subject: 'Podverse Checkout Issue',
    body: `Please explain your issue below and we'll get back to you as soon as we can:`
  }
}
