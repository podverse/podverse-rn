import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  getEpisodeId: any
  getMediaRefId: any
  navigation: any
}

export const NavAddToPlaylistIcon = (props: Props) => {
  const { getEpisodeId, getMediaRefId, navigation } = props

  return (
    <Icon
      color='#fff'
      name='plus'
      onPress={() => {
        const mediaRefId = getMediaRefId()
        const episodeId = getEpisodeId()
        navigation.navigate(PV.RouteNames.PlaylistsAddToScreen,
          { ...(mediaRefId ? { mediaRefId } : { episodeId }) }
        )
      }}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
