import React from 'react'
import { useGlobal } from 'reactn'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { goToCurrentLiveTime } from '../state/actions/player'
import { PressableWithOpacity, Text } from '.'

export const PlayerLiveButton = () => {
  const [globalTheme] = useGlobal('globalTheme')
  const [screenPlayer] = useGlobal('screenPlayer')
  const { liveStreamWasPaused } = screenPlayer

  const hitSlop = {
    bottom: 8,
    left: 8,
    right: 8,
    top: 8
  }

  const buttonStyle = liveStreamWasPaused ? [styles.pausedBadge] : [[styles.badge, globalTheme.liveStatusBadge]]
  const textStyle = liveStreamWasPaused ? [styles.pausedText] : [[styles.text, globalTheme.liveStatusBadgeText]]

  return (
    <PressableWithOpacity
      accessibilityHint={translate('ARIA HINT - go to current livestream time')}
      accessibilityLabel={translate('Live')}
      accessibilityRole='button'
      hitSlop={hitSlop}
      onPress={goToCurrentLiveTime}
      style={buttonStyle}>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.sm}
        numberOfLines={1}
        style={textStyle}
        testID='player_live_button'>
        {translate('Live')}
      </Text>
    </PressableWithOpacity>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'center',
    height: PV.Table.sectionHeader.height - 6,
    marginLeft: 4,
    marginTop: 3,
    paddingHorizontal: 16
  },
  pausedBadge: {
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 0,
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'center',
    height: PV.Table.sectionHeader.height - 6,
    marginLeft: 4,
    marginTop: 3,
    paddingHorizontal: 16
  },
  pausedText: {
    color: PV.Colors.linkColor,
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 3
  },
  text: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 3
  }
})
