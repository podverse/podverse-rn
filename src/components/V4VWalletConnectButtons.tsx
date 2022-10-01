import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { v4vDisconnectProvider } from '../state/actions/v4v/v4v'
import { Button, View } from '.'

type Props = {
  disconnectCallback: any
  isConnected: boolean
  loginRouteName: string
  navigation: any
  testID: string
  v4vKey: string
}

export const V4VWalletConnectButtons = (props: Props) => {
  const { isConnected, loginRouteName, navigation, testID, v4vKey } = props

  const _handleConnectWalletPress = () => {
    navigation.navigate(loginRouteName)
  }

  const _handleDisconnectWalletPress = () => {
    v4vDisconnectProvider(v4vKey)
  }

  return (
    <View>
      {isConnected && (
        <Button
          isWarning
          onPress={_handleDisconnectWalletPress}
          testID={`${testID}_disconnect_wallet`}
          text={translate('Disconnect Wallet')}
          wrapperStyles={styles.button}
        />
      )}
      {!isConnected && (
        <Button
          onPress={_handleConnectWalletPress}
          testID={`${testID}_connect_wallet`}
          text={translate('Connect Wallet')}
          wrapperStyles={styles.button}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 36,
    marginTop: 36,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '90%'
  }
})
