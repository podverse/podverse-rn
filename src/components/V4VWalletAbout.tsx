import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { _v4v_env_ } from '../services/v4v/v4v'
import { Text } from '.'

type Props = {
  testID: string
  v4vKey: string
}

export const V4VWalletAbout = (props: Props) => {
  const { testID, v4vKey } = props

  const _handleAboutPress = () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(PV.V4V.providers[v4vKey].env[_v4v_env_].aboutUrl) }
    ])
  }

  return (
    <Text
      accessible
      accessibilityLabel={translate('About')}
      accessibilityRole='button'
      fontSizeLargestScale={PV.Fonts.largeSizes.md}
      key={`${testID}_about_button`}
      onPress={_handleAboutPress}
      style={styles.aboutButton}
      testID={`${testID}_about_button`}>
      {translate('About')}
    </Text>
  )
}

const styles = StyleSheet.create({
  aboutButton: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    marginVertical: 20,
    padding: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    width: '100%'
  }
})
