import React from 'react'
import Config from 'react-native-config'
import Share from 'react-native-share'
import { getGlobal } from 'reactn'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  clipTitle?: string
  endingText?: string
  episodeTitle?: string
  getUrl?: any
  globalTheme?: GlobalTheme
  handlePress?: any
  playlistTitle?: string
  podcastTitle?: string
  profileName?: string
  urlId?: string
  urlPath?: string
}

export const NavShareIcon = (props: Props) => {
  if (Config.DISABLE_SHARE) return null

  const {
    clipTitle,
    endingText,
    episodeTitle,
    handlePress,
    playlistTitle,
    podcastTitle,
    profileName,
    urlId,
    urlPath
  } = props

  const onShare = async () => {
    const { urlsWeb } = getGlobal()
    const url = `${urlsWeb.baseUrl}${urlPath}${urlId ? `${urlId}` : ''}`

    let title = ''
    if (playlistTitle) title = playlistTitle
    if (clipTitle) title = `${clipTitle} – `
    if (podcastTitle) title += `${podcastTitle}`
    if (episodeTitle) title += ` – ${episodeTitle}`
    if (endingText) title += `${endingText}`
    if (profileName) {
      title = `${profileName || translate('anonymous')} - ${translate(`favorite podcasts on brandName`)}`
    }

    try {
      await Share.open({
        title,
        subject: title,
        url
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - share this podcast')}
      accessibilityLabel={translate('Share')}
      accessibilityRole='button'
      handlePress={handlePress ? handlePress : onShare}
      testID='nav_share_icon'>
      <NavItemIcon name='share-square' solid color={color} />
    </NavItemWrapper>
  )
}
