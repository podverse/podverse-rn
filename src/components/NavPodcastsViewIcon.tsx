import React from 'react'
import { useGlobal } from 'reactn'
import { setShouldshowPodcastsListPopover } from '../state/actions/podcasts-ui'
import { translate } from '../lib/i18n'
import { NavItemIcon, NavItemWrapper } from '.'

export const NavPodcastsViewIcon = () => {
  const [showPodcastsListPopover] = useGlobal('showPodcastsListPopover')

  const handlePress = () => {
    setShouldshowPodcastsListPopover(!showPodcastsListPopover)
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - change podcasts view layout')}
      accessibilityLabel={translate('Podcasts View Layout')}
      accessibilityRole='button'
      handlePress={handlePress}
      testID='nav_layout_icon'>
        <NavItemIcon name='list' />
    </NavItemWrapper>
  )
}
