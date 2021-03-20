import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Icon } from './'

type Props = {
  handleToggleSettings: any
  showCheckmark?: boolean
  testID: string
}

export const SettingsButton = (props: Props) => {
  const { handleToggleSettings, showCheckmark, testID } = props

  return (
    <TouchableWithoutFeedback onPress={handleToggleSettings} hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}>
      <View style={styles.buttonView}>
        <View>
          <Icon isSecondary name={showCheckmark ? 'check' : 'cog'} size={18} solid testID={testID} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
