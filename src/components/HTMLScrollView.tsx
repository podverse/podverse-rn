import { Dimensions, ScrollView, StyleSheet } from 'react-native'
import HTML from 'react-native-render-html'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  html: string
  navigation: any
}

export const HTMLScrollView = (props: Props) => {
  const { html, navigation } = props
  const [globalTheme] = useGlobal('globalTheme')
  const baseFontStyle = {
    ...globalTheme.text,
    ...styles.baseFontStyle
  }

  return (
    <ScrollView style={styles.scrollView}>
      <HTML
        baseFontStyle={baseFontStyle}
        containerStyle={styles.html}
        html={html}
        imagesMaxWidth={Dimensions.get('window').width}
        onLinkPress={(event, href) => navigation.navigate(PV.RouteNames.WebPageScreen, { uri: href })}
        ptSize={PV.Fonts.sizes.lg} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  baseFontStyle: {
    fontSize: PV.Fonts.sizes.lg
  },
  html: {
    margin: 8
  },
  scrollView: {
    flex: 1
  }
})
