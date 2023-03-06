import { Pressable, StyleSheet, View } from 'react-native'
import React, { useEffect, useGlobal, useState } from 'reactn'
import { Icon, Text } from '../components'
import { translate } from '../lib/i18n'
import { getMembershipStatus } from '../lib/membership'
import { readableDate, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'

type State = {
  hideKey: string | null
  wrapperStyles: [any?, any?]
  alertTitle: string
  alertTitleStyle: any
  linkAction: any
  showAlert: boolean
}

export const OverlayAlert = () => {
  const [globalTheme] = useGlobal('globalTheme')
  const { overlayAlertLink: overlayAlertLinkStyles } = globalTheme
  const [state, setState] = useState<State>({
    hideKey: null,
    wrapperStyles: [],
    alertTitle: '',
    alertTitleStyle: {},
    linkAction: () => null,
    showAlert: false
  })
  const [session] = useGlobal('session')
  const [membershipStatus, setMembershipStatus] = useState('')

  useEffect(() => {
    const { userInfo } = session
    const currentMembershipStatus = getMembershipStatus(userInfo)

    if (currentMembershipStatus !== membershipStatus) {
      setMembershipStatus(currentMembershipStatus)
      if (currentMembershipStatus === PV.MembershipStatus.FREE_TRIAL_EXPIRED) {
        const freeTrialExpiration = readableDate(safelyUnwrapNestedVariable(() => userInfo.freeTrialExpiration, ''))
        setState({
          hideKey: 'hideFreeTrialExpired',
          // eslint-disable-next-line max-len
          alertTitle: `${translate('Your free trial expired')}${freeTrialExpiration} ${translate(
            'Please renew your membership to continue using premium features'
          )}`,
          wrapperStyles: [styles.wrapper, globalTheme.overlayAlertDanger],
          alertTitleStyle: globalTheme.overlayAlertDanger,
          linkAction: handleRenewMembership,
          showAlert: true
        })
      } else if (currentMembershipStatus === PV.MembershipStatus.FREE_TRIAL_EXPIRING_SOON) {
        const freeTrialExpiration = readableDate(safelyUnwrapNestedVariable(() => userInfo.freeTrialExpiration, ''))
        setState({
          hideKey: 'hideFreeTrialExpiring',
          alertTitle: `${translate('Your free trial expires')}${freeTrialExpiration}`,
          wrapperStyles: [styles.wrapper, globalTheme.overlayAlertWarning],
          alertTitleStyle: globalTheme.overlayAlertWarning,
          linkAction: handleRenewMembership,
          showAlert: true
        })
      } else if (currentMembershipStatus === PV.MembershipStatus.PREMIUM_EXPIRED) {
        const membershipExpiration = readableDate(safelyUnwrapNestedVariable(() => userInfo.membershipExpiration, ''))

        setState({
          hideKey: 'hideMembershipExpired',
          // eslint-disable-next-line max-len
          alertTitle: `${translate('Your membership expired')}${membershipExpiration}. ${translate(
            'Please renew your membership to continue using premium features'
          )}`,
          wrapperStyles: [styles.wrapper, globalTheme.overlayAlertDanger],
          alertTitleStyle: globalTheme.overlayAlertDanger,
          linkAction: handleRenewMembership,
          showAlert: true
        })
      } else if (currentMembershipStatus === PV.MembershipStatus.PREMIUM_EXPIRING_SOON) {
        const membershipExpiration = readableDate(safelyUnwrapNestedVariable(() => userInfo.membershipExpiration, ''))
        setState({
          hideKey: 'hideMembershipExpiring',
          alertTitle: `${translate('Your premium membership expires')}${membershipExpiration}.`,
          wrapperStyles: [styles.wrapper, globalTheme.overlayAlertWarning],
          alertTitleStyle: globalTheme.overlayAlertWarning,
          linkAction: handleRenewMembership,
          showAlert: true
        })
      } else {
        setState({
          ...state,
          showAlert: false
        })
      }
    }
  }, [session])

  const handleCloseButton = () => {
    setState({
      ...state,
      showAlert: false
    })
  }

  const handleRenewMembership = () => {
    setState({
      ...state,
      showAlert: false
    })

    /* I don't know how to pass navigation into the OverlayAlert in the App component,
       so using an event to trigger navigation instead.
    */
    PVEventEmitter.emit(PV.Events.NAV_TO_MEMBERSHIP_SCREEN)
  }

  if (!state.showAlert) {
    return null
  }

  return (
    <View style={state.wrapperStyles}>
      <View style={styles.textWrapper}>
        <Text style={[styles.text, state.alertTitleStyle]}>{state.alertTitle}</Text>
        <Text onPress={state.linkAction} style={[styles.textLink, overlayAlertLinkStyles]}>
          {translate('Renew Membership')}
        </Text>
      </View>
      <Pressable
        hitSlop={{
          bottom: 4,
          left: 4,
          right: 4,
          top: 4
        }}
        onPress={handleCloseButton}>
        <View style={styles.iconWrapper}>
          <Icon color={PV.Colors.white} name='times' size={28} />
        </View>
      </Pressable>
    </View>
  )
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
