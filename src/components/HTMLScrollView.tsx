import { Dimensions, Linking, ScrollView, StyleSheet } from 'react-native'
import RenderHTML from 'react-native-render-html'
import React, { useGlobal } from 'reactn'
import {
  convertHHMMSSToAnchorTags,
  filterHTMLElementsFromString,
  removeExtraInfoFromEpisodeDescription,
  removeHTMLAttributesFromString
} from '../lib/utility'
import { PV } from '../resources'
import { setPlaybackPosition } from '../services/player'
import { TableSectionSelectors } from './TableSectionSelectors'

type Props = {
  disableScrolling?: boolean
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  html: string
  sectionTitle?: string
  style: any
}

export const HTMLScrollView = (props: Props) => {
  const { disableScrolling, fontSizeLargerScale, fontSizeLargestScale, html, sectionTitle, style } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const [censorNSFWText] = useGlobal('censorNSFWText')

  const baseFontStyle = {
    ...globalTheme.text,
    ...styles.baseFontStyle
  }

  let formattedHtml = html ? removeHTMLAttributesFromString(html.sanitize(censorNSFWText)) : ''
  formattedHtml = filterHTMLElementsFromString(formattedHtml)
  formattedHtml = convertHHMMSSToAnchorTags(formattedHtml)
  formattedHtml = removeExtraInfoFromEpisodeDescription(formattedHtml)
  formattedHtml = formattedHtml.linkifyHtml()

  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    baseFontStyle.fontSize = fontSizeLargerScale
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    baseFontStyle.fontSize = fontSizeLargestScale
  }

  const source = {
    html: formattedHtml
  }

  return (
    <ScrollView style={[styles.scrollView, style]} scrollEnabled={!disableScrolling}>
      {!!sectionTitle &&
        <TableSectionSelectors disableFilter selectedFilterLabel={sectionTitle} />
      }
      <RenderHTML
        // baseFontStyle={baseFontStyle}
        baseStyle={styles.html}
        contentWidth={Dimensions.get('window').width}
        imagesMaxWidth={Dimensions.get('window').width}
        renderersProps={{
          a: {
            onPress: (event: any, href: string, attributes: any) => {
              const startTime = parseInt(attributes && attributes['data-start-time'], 10)
              if ((startTime || startTime === 0)) {
                setPlaybackPosition(startTime)
              } else if (href) {
                Linking.openURL(href)
              }
            }
          }
        }}
        source={source}
        tagsStyles={customHTMLTagStyles}
      />
    </ScrollView>
  )
}

const customHTMLTagStyles = {
  h1: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  },
  h2: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  },
  h3: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  },
  h4: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  },
  h5: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white
  },
  h6: {
    marginBottom: 12,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.normal,
    color: PV.Colors.white
  },
  p: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: PV.Fonts.sizes.lg,
    color: PV.Colors.white
  },
  a: {
    fontSize: PV.Fonts.sizes.lg,
    color: PV.Colors.skyLight
  },
  ul: {
    marginBottom: 0,
    marginLeft: -16,
    marginRight: 0,
    marginTop: 0,
    paddingLeft: 0,
    listStyleType: 'none',
    color: PV.Colors.white
  },
  li: {
    listStyleType: 'none',
    color: PV.Colors.white
  },
  img: {
    display: 'none'
  }
}

const styles = StyleSheet.create({
  baseFontStyle: {
    fontSize: PV.Fonts.sizes.lg
  },
  html: {
    backgroundColor: 'transparent',
    marginHorizontal: 8,
    marginBottom: 12
  },
  scrollView: {
    backgroundColor: 'transparent',
    flex: 1
  }
})
