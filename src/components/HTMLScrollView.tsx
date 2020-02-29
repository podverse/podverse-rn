import { Dimensions, Linking, ScrollView, StyleSheet } from 'react-native'
import HTML from 'react-native-render-html'
import React, { getGlobal } from 'reactn'
import { convertHHMMSSToAnchorTags, removeHTMLAttributesFromString } from '../lib/utility'
import { PV } from '../resources'
import { setPlaybackPosition } from '../services/player'

type Props = {
  fontSizeScaleLarger?: number
  fontSizeScaleLargest?: number
  html: string
}

export const HTMLScrollView = (props: Props) => {
  const { fontSizeScaleLarger, fontSizeScaleLargest, html } = props
  const { fontScaleMode, globalTheme } = getGlobal()
  const baseFontStyle = {
    ...globalTheme.text,
    ...styles.baseFontStyle
  }

  let formattedHtml = removeHTMLAttributesFromString(html)
  formattedHtml = convertHHMMSSToAnchorTags(formattedHtml)
  formattedHtml = formattedHtml.linkifyHtml()

  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    baseFontStyle.fontSize = fontSizeScaleLarger
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    baseFontStyle.fontSize = fontSizeScaleLargest
  }

  return (
    <ScrollView style={styles.scrollView}>
      <HTML
        baseFontStyle={baseFontStyle}
        containerStyle={styles.html}
        html={formattedHtml}
        imagesMaxWidth={Dimensions.get('window').width}
        onLinkPress={(event: any, href: string, attributes: any) => {
          const isTimestamp = true
          const startTime = parseInt(attributes && attributes['data-start-time'], 10)
          if (isTimestamp && (startTime || startTime === 0)) {
            setPlaybackPosition(startTime)
          } else if (href) {
            Linking.openURL(href)
          }
        }}
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
    marginHorizontal: 8,
    marginVertical: 12
  },
  scrollView: {
    flex: 1
  }
})
