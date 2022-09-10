import { Episode, Podcast } from 'podverse-shared'
import React, { getGlobal } from 'reactn'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  episode?: Episode
  globalTheme: any
  navigation: any
  podcast?: Podcast
}

export const NavFundingIcon = (props: Props) => {
  const { episode, globalTheme, navigation, podcast } = props

  const handlePress = () => {
    const { globalTheme, session } = getGlobal()
    const isLoggedIn = safelyUnwrapNestedVariable(() => session.isLoggedIn, false)
    if (podcast) {
      navigation.navigate(PV.RouteNames.FundingPodcastEpisodeScreen, {
        isLoggedIn,
        globalTheme,
        podcast,
        episode
      })
    } else {
      navigation.navigate(PV.RouteNames.FundingNowPlayingItemScreen, {
        isLoggedIn,
        globalTheme
      })
    }
  }

  let color = darkTheme.text.color
  if (globalTheme) {
    color = globalTheme?.text?.color
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - go to the funding information for this podcast')}
      accessibilityLabel={translate('Funding')}
      accessibilityRole='button'
      handlePress={handlePress}
      testID='nav_funding_icon'>
      <NavItemIcon name='donate' color={color} />
    </NavItemWrapper>
  )
}
