import React from 'react'
import { useGlobal } from 'reactn'
import { Image, StyleSheet } from 'react-native'
import { setPodcastsGridView } from '../state/actions/settings'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from '.'

export const NavPodcastsViewIcon = () => {
  const [gridEnabled] = useGlobal('podcastsGridViewEnabled')

  const handlePress = () => {
    setPodcastsGridView(!gridEnabled)
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - change podcasts view layout')}
      accessibilityLabel={translate('Podcasts View Layout')}
      accessibilityRole='button'
      handlePress={handlePress}
      testID='nav_layout_icon'>
      {gridEnabled ? (
        <NavItemIcon name='list' />
      ) : (
        <Image source={PV.Images.GRID_ICON} resizeMode='contain' style={styles.gridIcon} />
      )}
    </NavItemWrapper>
  )
}

const styles = StyleSheet.create({
  gridIcon: {
    tintColor: PV.Colors.white,
    width: 30,
    height: 30
  }
})
