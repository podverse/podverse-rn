import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { getGlobal, setGlobal } from 'reactn'
import { Icon } from '../components'
import { getMembershipStatus, readableDate, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'

type Props = {}
type State = {}

export class OverlayAlert extends React.PureComponent<Props, State> {
  render () {
    const { global: globalState } = this
    const user = safelyUnwrapNestedVariable(() => globalState.session.userInfo, {})
    const { globalTheme, overlayAlert } = globalState
    const { overlayAlertLink: overlayAlertLinkStyles } = globalTheme
    const { hideFreeTrialExpired, hideFreeTrialExpiring, hideMembershipExpired, hideMembershipExpiring } = overlayAlert
    const wrapperStyles = [styles.wrapper] as any[]
    let overlayNode = null
    let hideKey = null

    const handleCloseButton = (hideKey: string | null) => {
      const globalState = getGlobal()
      setGlobal({
        overlayAlert: {
          ...globalState.overlayAlert,
          ...(hideKey ? { [hideKey]: true } : {})
        }
      })
    }

    const handleRenewMembership = () => {
      // TODO!
      console.log('dismiss alert')
      console.log('navigate to renew membership')
    }

    const freeTrialExpiration = readableDate(safelyUnwrapNestedVariable(() => globalState.session.userInfo.freeTrialExpiration, ''))
    const membershipExpiration = readableDate(safelyUnwrapNestedVariable(() => globalState.session.userInfo.membershipExpiration, ''))

    const freeTrialExpired = (
      <View style={styles.textWrapper}>
        <Text style={[styles.text, globalTheme.overlayAlertDanger]}>
          Your free trial expired {freeTrialExpiration}. Please renew your membership to continue using premium features.
      </Text>
        <Text
          onPress={handleRenewMembership}
          style={[styles.textLink, overlayAlertLinkStyles]}>
          Renew Membership
      </Text>
      </View>
    )

    const freeTrialExpiring = (
      <View style={styles.textWrapper}>
        <Text style={[styles.text, globalTheme.overlayAlertWarning]}>
          Your free trial expires {freeTrialExpiration}.
      </Text>
        <Text
          onPress={handleRenewMembership}
          style={[styles.textLink, overlayAlertLinkStyles]}>
          Renew Membership
      </Text>
      </View>
    )

    const membershipExpired = (
      <View style={styles.textWrapper}>
        <Text style={[styles.text, globalTheme.overlayAlertDanger]}>Your membership expired {membershipExpiration}.
          Please renew your membership to continue using premium features.
      </Text>
        <Text
          onPress={handleRenewMembership}
          style={[styles.textLink, overlayAlertLinkStyles]}>
          Renew Membership
      </Text>
      </View>
    )

    const membershipExpiring = (
      <View style={styles.textWrapper}>
        <Text style={[styles.text, globalTheme.overlayAlertWarning]}>
          Your premium membership expires {membershipExpiration}.
      </Text>
        <Text
          onPress={handleRenewMembership}
          style={[styles.textLink, overlayAlertLinkStyles]}>
          Renew Membership
      </Text>
      </View>
    )

    const membershipStatus = getMembershipStatus(user)

    if (!hideFreeTrialExpired && membershipStatus === PV.MembershipStatus.FREE_TRIAL_EXPIRED) {
      wrapperStyles.push(globalTheme.overlayAlertDanger)
      overlayNode = freeTrialExpired
      hideKey = 'hideFreeTrialExpired'
    } else if (!hideFreeTrialExpiring && membershipStatus === PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON) {
      wrapperStyles.push(globalTheme.overlayAlertWarning)
      overlayNode = freeTrialExpiring
      hideKey = 'hideFreeTrialExpiring'
    } else if (!hideMembershipExpired && membershipStatus === PV.MembershipStatus.PREMIUM_EXPIRED) {
      wrapperStyles.push(globalTheme.overlayAlertDanger)
      overlayNode = membershipExpired
      hideKey = 'hideMembershipExpired'
    } else if (!hideMembershipExpiring && membershipStatus === PV.MembershipStatus.PREMIUM_EXPIRING_SOON) {
      wrapperStyles.push(globalTheme.overlayAlertWarning)
      overlayNode = membershipExpiring
      hideKey = 'hideMembershipExpiring'
    }

    if (!overlayNode) {
      return null
    }

    return (
      <View style={wrapperStyles}>
        {overlayNode}
        <TouchableWithoutFeedback onPress={() => handleCloseButton(hideKey)}>
          <View style={styles.iconWrapper}>
            <Icon
              color={PV.Colors.white}
              name='times'
              size={28} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8,
    paddingRight: 12,
    width: 48
  },
  text: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold
  },
  textLink: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginTop: 12
  },
  textWrapper: {
    flex: 1
  },
  wrapper: {
    flexDirection: 'row',
    left: 0,
    paddingLeft: 12,
    paddingVertical: 20,
    position: 'absolute',
    right: 0,
    top: 88
  }
})
