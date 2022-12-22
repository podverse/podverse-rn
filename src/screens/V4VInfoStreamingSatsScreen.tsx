import { StyleSheet, SafeAreaView } from 'react-native'
import React from 'reactn'
import { ScrollView, Text } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any

const testIDPrefix = 'value_tag_info_streaming_sats_screen'

export class V4VInfoStreamingSatsScreen extends React.Component<Props> {
  static navigationOptions = () => {
    return {
      headerRight: () => null,
      title: null
    }
  }

  componentDidMount() {
    trackPageView('/value-for-value-info-streaming-sats', 'Value for Value Info Streaming Sats Screen')
  }

  render() {
    return (
      <SafeAreaView style={styles.content} testID={`${testIDPrefix}_view`.prependTestId()}>
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.xl} style={styles.title}>
          {translate('value_tag_info_streaming_sats_title')}
        </Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentView}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_info_streaming_sats_text_1')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_info_streaming_sats_text_2')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_info_streaming_sats_text_3')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.lg} style={styles.text}>
            {translate('value_tag_info_streaming_sats_text_4')}
          </Text>
        </ScrollView>
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
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: 0
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    marginVertical: 10
  }
})
