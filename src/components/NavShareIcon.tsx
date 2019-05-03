import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'
import { Share } from 'react-native'

type Props = {
  url: string
}

export const NavShareIcon = (props: Props) => {
  const { url } = props

  onShare = async () => {
    try {
      const result = await Share.share({ url })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <Icon
      color='#fff'
      name='share'
      onPress={this.onShare}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
