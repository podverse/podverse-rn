import React from 'react'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { View } from './'

type Props = {
  html: string
  isLoading: boolean
}

const generateCustomCSSStyles = (globalTheme) => {
  return `
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <style>
      html {
        background-color: ${globalTheme.webViewStaticHTMLWrapper.backgroundColor};
        font-family: '-apple-system', 'sans-serif';
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${globalTheme.webViewStaticHTMLHeader.color};
      }
      h1 {
        font-size: ${PV.Fonts.sizes.xl};
        font-weight: ${PV.Fonts.weights.bold};
      }
      h2 {
        font-size: ${PV.Fonts.sizes.lg};
        font-weight: ${PV.Fonts.weights.bold};
      }
      h3 {
        font-size: ${PV.Fonts.sizes.md};
        font-weight: ${PV.Fonts.weights.bold};
      }
      p {
        color: ${globalTheme.webViewStaticHTMLText.color};
        font-size: ${PV.Fonts.sizes.lg};
      }
      a {
        color: ${globalTheme.webViewStaticHTMLLink.color};
        font-size: ${PV.Fonts.sizes.lg};
      }
      ul {
        list-style-type: none;
        margin-bottom: 1.25rem;
        margin-top: 1.25rem;
        padding: 0;
      }
      li {
        margin-bottom: 1.25rem;
      }
      li a {
        font-size: ${PV.Fonts.sizes.xl};
      }
    </style>
  `
}

export const WebViewStaticHTML = (props: Props) => {
  const { html, isLoading } = props
  const [globalTheme] = useGlobal('globalTheme')
  const styledHTML = generateCustomCSSStyles(globalTheme) + html

  return (
    <View style={isLoading ? { display: 'none' } : styles.view}>
      <WebView
        accessible={false}
        containerStyle={styles.view}
        originWhitelist={['*']}
        source={{ html: styledHTML }}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
