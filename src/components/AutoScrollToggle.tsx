import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text } from '.'

type Props = {
  autoScrollOn: boolean
  toggleAutoscroll: any
}

export const AutoScrollToggle = (props: Props) => {
  const { autoScrollOn, toggleAutoscroll } = props

  return (
    <TouchableOpacity
      accessible={false}
      activeOpacity={0.7}
      onPress={toggleAutoscroll}>
      <Text
        accessible={false}
        isNowPlaying={!!autoScrollOn}
        style={[styles.autoScrollerText]}
        testID='transcript-autoscroll'>
        {!!autoScrollOn ? translate('Autoscroll On') : translate('Autoscroll Off')}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  autoScrollerText: {
    borderRadius: 16,
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    paddingVertical: 5,
    paddingHorizontal: 10
  }
})
