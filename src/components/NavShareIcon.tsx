import React from 'react'
import { Share } from 'react-native'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  getUrl?: any
  url?: string
}

export const NavShareIcon = (props: Props) => {
  const { getUrl } = props
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
      onPress={onShare}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
