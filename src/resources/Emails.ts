/* eslint-disable max-len */
import { Platform } from 'react-native'
import Config from 'react-native-config'
import { getBuildNumber, getVersion } from 'react-native-device-info'

const bugReportSubject = 'Bug Report: '
const bugReportBody = `If you are reporting an issue, please provide your device type and/or brand and steps to reproduce the bug if possible. Thank you! / Platform: ${
  Platform.OS
} / Version: ${getVersion()} build ${getBuildNumber()}`
const checkoutIssueSubject = 'Checkout Issue: '
const checkoutIssueBody = `Please explain your issue below and we'll get back to you as soon as we can. / Platform: ${
  Platform.OS
} / Version: ${getVersion()} build ${getBuildNumber()}`
const featureRequestSubject = 'Feature Request: '
const featureRequestBody = 'Please describe the feature you would like added to Podverse.'
const podcastRequestSubject = 'Podcast Request: '
const podcastRequestBody = 'Please provide the name of the podcast, and the name of the host if you know it.'
const generalSubject = ''

export const Emails = {
  BUG_REPORT: {
    email: Config.CONTACT_EMAIL,
    subject: bugReportSubject,
    body: bugReportBody
  },
  CHECKOUT_ISSUE: {
    email: Config.CONTACT_EMAIL,
    subject: checkoutIssueSubject,
    body: checkoutIssueBody
  },
  FEATURE_REQUEST: {
    email: Config.CONTACT_EMAIL,
    subject: featureRequestSubject,
    body: featureRequestBody
  },
  GENERAL_CONTACT: {
    email: Config.CONTACT_EMAIL,
    subject: generalSubject,
    body: bugReportBody
  },
  PODCAST_REQUEST: {
    email: Config.CONTACT_EMAIL,
    subject: podcastRequestSubject,
    body: podcastRequestBody
  }
}
