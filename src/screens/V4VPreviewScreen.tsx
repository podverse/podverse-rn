import { StyleSheet, SafeAreaView, Image } from 'react-native'
import React, { getGlobal } from 'reactn'
import { Button, NavDismissIcon, ScrollView, Text } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any

const testIDPrefix = 'value_tag_preview_screen'

export class V4VPreviewScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()

    return {
      headerLeft: () => (
        <NavDismissIcon globalTheme={globalTheme} handlePress={navigation.dismiss} testID={testIDPrefix} />
      ),
      headerRight: () => null,
      title: null
    }
  }

  componentDidMount() {
    trackPageView('/value-for-value-preview', 'Value for Value Preview Screen')
  }

  _navigateToConsentScreen() {
    this.props.navigation.navigate(PV.RouteNames.V4VConsentScreen)
  }

  render() {
    return (
      <SafeAreaView style={styles.content} testID={`${testIDPrefix}_view`.prependTestId()}>
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.xl} style={styles.title}>
          {translate('value_tag_preview_title')}
        </Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentView}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_preview_boost')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_preview_boostagram')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_preview_streaming')}
          </Text>
          <Image
            source={require('../resources/images/crypto_exmpl_1.jpg')}
            resizeMode='contain'
            style={styles.previewImage}
          />
        </ScrollView>
        <Button
          onPress={() => this._navigateToConsentScreen()}
          testID={`${testIDPrefix}_next`}
          text={translate('Next')}
          wrapperStyles={styles.nextButton}
        />
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: PV.Colors.ink
  },
  scrollView: {
    flex: 1
  },
  scrollContentView: {
    padding: 20
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
    width: '90%'
  },
  previewImage: {
    borderColor: 'white',
    borderWidth: 1,
    width: '100%',
    height: 250,
    marginTop: 36
  },
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: 0
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl,
    marginVertical: 10
  }
})
