import { StyleSheet } from 'react-native'
import React, { getGlobal } from 'reactn'
import { Button, NavDismissIcon, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any

const testIDPrefix = 'crypto_preview_screen'

export class CryptoPreviewScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()

    return {
      headerLeft: () => (
        <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />
      ),
      headerRight: null,
      title: null
    }
  }

  componentDidMount() {
    trackPageView('/crypto-preview', 'Crypto Preview Screen')
  }

  _navigateToConsentScreen() {
    this.props.navigation.navigate(PV.RouteNames.CryptoConsentScreen)
  }

  render() {
    return (
      <View style={styles.content} {...testProps(`${testIDPrefix}_view`)}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={styles.text}>
          {translate('Crypto Preview')}
        </Text>
        <Button
          onPress={() => this._navigateToConsentScreen()}
          testID={`${testIDPrefix}_next`}
          text={translate('Next')}
          wrapperStyles={styles.nextButton} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '90%'
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl
  }
})
