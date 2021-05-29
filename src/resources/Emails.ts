import Config from 'react-native-config'

export const Emails = {
  CONTACT_US: {
    email: Config.CONTACT_US_EMAIL,
    subject: 'Contact Podverse',
    body:
      'If you are reporting an issue, please provide your device type ' +
      'and steps to reproduce the bug if possible. Thank you!'
  },
  CHECKOUT_ISSUE: {
    email: Config.SUPPORT_EMAIL,
    subject: 'Podverse Checkout Issue',
    body: `Please explain your issue below and we'll get back to you as soon as we can:`
  },
  REQUEST_PODCAST: {
    email: Config.CURATOR_EMAIL,
    subject: 'Podverse - Request Podcast',
    body:
      'Please provide the title of the podcast. ' + 
      'If there are multiple podcasts with the same title, ' +
      'please provide a link to the podcast so we know which one you are requesting.'
  },
}
