import React from 'react'
import Share from 'react-native-share'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  clipTitle?: string
  endingText?: string
  episodeTitle?: string
  getUrl?: any
  handlePress?: any
  playlistTitle?: string
  podcastTitle?: string
  profileName?: string
  url?: string
}

export const NavShareIcon = (props: Props) => {
  const { clipTitle, endingText, episodeTitle, getUrl, handlePress, playlistTitle, podcastTitle, profileName } = props
  let { url = '' } = props

  const onShare = async () => {
    if (getUrl) url = getUrl()

    let title = ''
    if (playlistTitle) title = playlistTitle
    if (clipTitle) title = `${clipTitle} – `
    if (podcastTitle) title += `${podcastTitle}`
    if (episodeTitle) title += ` – ${episodeTitle}`
    if (endingText) title += `${endingText}`
    if (profileName) {
      title = `${profileName || 'anonymous'}'s favorite podcasts on Podverse`
    }

    try {
      await Share.open({
        title,
        subject: title,
        url
      })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <NavItemWrapper handlePress={handlePress ? handlePress : onShare}>
      <NavItemIcon name='share' />
    </NavItemWrapper>
  )
}
