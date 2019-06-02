import React from 'react'
import { Share } from 'react-native'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  getUrl?: any
  handlePress?: any
  url?: string
}

export const NavShareIcon = (props: Props) => {
  const { getUrl, handlePress } = props
  let { url = '' } = props

  const onShare = async () => {
    if (getUrl) {
      url = getUrl()
    }

    try {
      await Share.share({ url })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <Icon
      color='#fff'
      name='share'
      onPress={handlePress ? handlePress : onShare}
      size={PV.Icons.NAV}
      style={navHeader.buttonIcon} />
  )
}
