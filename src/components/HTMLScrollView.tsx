import { Dimensions, Linking, ScrollView, StyleSheet } from 'react-native'
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
        onLinkPress={(event: any, href: string) => Linking.openURL(href)}
        ptSize={PV.Fonts.sizes.lg}
        tagsStyles={customHTMLTagStyles}
      />
    </ScrollView>
  )
}

const customHTMLTagStyles = {
  h1: {
    marginBottom: 8,
    marginTop: 4
  },
  h2: {
    marginBottom: 8,
    marginTop: 4
  },
  h3: {
    marginBottom: 8,
    marginTop: 4
  },
  h4: {
    marginBottom: 8,
    marginTop: 4
  },
  h5: {
    marginBottom: 8,
    marginTop: 4
  },
  h6: {
    marginBottom: 8,
    marginTop: 4
  },
  p: {
    marginBottom: 8,
    marginTop: 4
  }
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
