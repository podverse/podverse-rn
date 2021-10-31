import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
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
    <Pressable
      accessible={false}
      activeOpacity={0.7}
      onPress={toggleAutoscroll}
      style={styles.wrapper}>
      <Text
        accessible={false}
        isNowPlaying={!!autoScrollOn}
        style={[styles.autoScrollerText]}
        testID='transcript-autoscroll'>
        {!!autoScrollOn ? translate('Autoscroll On') : translate('Autoscroll Off')}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  autoScrollerText: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    borderRadius: 16,
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    justifyContent: 'center',
    flex: 0,
    paddingVertical: 5,
    paddingHorizontal: 10
  }
})
