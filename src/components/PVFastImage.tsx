import { View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SvgUri } from 'react-native-svg'
import React from 'reactn'
import { Icon } from '.'
import { isValidUrl } from '../lib/utility'
const uuidv4 = require('uuid/v4')

type Props = {
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
    const { isSmall, resizeMode = 'contain', source, styles } = this.props
    const { hasError, uuid } = this.state
    const { offlineModeEnabled, userAgent } = this.global
    const cache = offlineModeEnabled ? 'cacheOnly' : 'web'
    const isValid = isValidUrl(source)
    const isSvg = source && source.indexOf('.svg') > 0

    const image = isSvg ? (
      <SvgUri width='100%' height='100%' uri={source} style={styles} />
    ) : (
      <FastImage
        key={uuid}
        onError={this._handleError}
        resizeMode={resizeMode}
        source={{
          uri: source,
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
            style={{
              ...styles,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Icon isSecondary={true} name='podcast' size={isSmall ? 32 : 36} />
          </View>
        )}
      </>
    )
  }
}
