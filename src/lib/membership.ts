import { PV } from '../resources'

export const getMembershipExpiration = (user: any) => {
  const { freeTrialExpiration, membershipExpiration } = user

  if (!membershipExpiration && freeTrialExpiration) {
    return freeTrialExpiration
  } else if (membershipExpiration) {
    return membershipExpiration
  }
  return
}

export const getMembershipStatus = (user: any) => {
  const { freeTrialExpiration, membershipExpiration } = user
  let freeTrialExpirationDate
  let membershipExpirationDate

  if (freeTrialExpiration) {
    freeTrialExpirationDate = new Date(freeTrialExpiration)
  }

  if (membershipExpiration) {
    membershipExpirationDate = new Date(membershipExpiration)
  }

  const currentDate = new Date()
  const weekBeforeCurrentDate = new Date()
  weekBeforeCurrentDate.setDate(weekBeforeCurrentDate.getDate() + 7)

  if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate <= currentDate) {
    return PV.MembershipStatus.FREE_TRIAL_EXPIRED
  } else if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate <= weekBeforeCurrentDate) {
    return PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON
  } else if (!membershipExpirationDate && freeTrialExpirationDate && freeTrialExpirationDate > currentDate) {
    return PV.MembershipStatus.FREE_TRIAL
  } else if (membershipExpirationDate && membershipExpirationDate <= currentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRED
  } else if (membershipExpirationDate && membershipExpirationDate <= weekBeforeCurrentDate) {
    return PV.MembershipStatus.PREMIUM_EXPIRING_SOON
  } else if (membershipExpirationDate && membershipExpirationDate > currentDate) {
    return PV.MembershipStatus.PREMIUM
  }

  return ''
}

export const shouldShowMembershipAlert = (user: any) => {
  const status = getMembershipStatus(user)
  const shouldAlert = [
    PV.MembershipStatus.FREE_TRIAL_EXPIRED,
    PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON,
    PV.MembershipStatus.PREMIUM_EXPIRED,
    PV.MembershipStatus.PREMIUM_EXPIRING_SOON
  ]
  return shouldAlert.includes(status)
}
