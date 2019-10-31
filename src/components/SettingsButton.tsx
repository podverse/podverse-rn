import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { Icon } from './'

type Props = {
  handleToggleSettings: any
  showCheckmark: boolean
}

export const SettingsButton = (props: Props) => {
  const { handleToggleSettings, showCheckmark } = props

  return (
    <TouchableWithoutFeedback onPress={handleToggleSettings}>
      <View style={styles.buttonView}>
        <View>
          <Icon
            isSecondary={true}
            name={showCheckmark ? 'check' : 'cog'}
            size={20}
            solid={true}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    flex: 0,
    height: 36,
    justifyContent: 'center',
    marginRight: 8,
    width: 36
  }
})
