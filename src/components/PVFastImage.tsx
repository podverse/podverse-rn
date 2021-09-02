import { Platform, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SvgUri } from 'react-native-svg'
import React from 'reactn'
import { isValidUrl } from '../lib/utility'
import { Icon } from '.'
const uuidv4 = require('uuid/v4')

type Props = {
  accessible?: boolean
  cache?: string
  isSmall?: boolean
  resizeMode?: any
  source?: string
  styles?: any
}

type State = {
  hasError: boolean
  uuid: string
}

export class PVFastImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      uuid: uuidv4()
    }
  }

  _handleError = () => {
    this.setState({ hasError: true })
  }

  render() {
    const { accessible = false, isSmall, resizeMode = 'contain', source, styles } = this.props
    const { hasError, uuid } = this.state
    const { offlineModeEnabled, userAgent } = this.global
    const cache = offlineModeEnabled ? 'cacheOnly' : 'immutable'
    const isValid = isValidUrl(source)
    const isSvg = source && source.endsWith('.svg')

    /* Insecure images will not load on iOS, so force image URLs to https */
    let secureImageUrl = source
    if (Platform.OS === 'ios' && secureImageUrl) {
      secureImageUrl = secureImageUrl?.replace('http://', 'https://')
    }

    const image = isSvg ? (
      <View style={styles}>
        <SvgUri accessible={accessible} width='100%' height='100%' uri={source} />
      </View>
    ) : (
      <FastImage
        accessible={accessible}
        fallback
        key={uuid}
        onError={this._handleError}
        resizeMode={resizeMode}
        source={{
          uri: secureImageUrl,
          cache,
          headers: {
            ...(userAgent ? { 'User-Agent': userAgent } : {})
          }
        }}
        style={styles}
      />
    )

    return (
      <>
        {isValid && !hasError ? (
          image
        ) : (
          <View
            accessible={accessible}
            style={{
              ...styles,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Icon isSecondary name='podcast' size={isSmall ? 32 : 36} />
          </View>
        )}
      </>
    )
  }
}
