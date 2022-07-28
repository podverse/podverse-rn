import { Platform, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SvgUri } from 'react-native-svg'
import React from 'reactn'
import { isValidUrl } from '../lib/utility'
import { downloadImageFile, getSavedImageUri } from '../lib/storage'
import { Icon } from '.'
const uuidv4 = require('uuid/v4')

type Props = {
  accessible?: boolean
  cache?: string
  isSmall?: boolean
  resizeMode?: any
  styles?: any
  source?: string
}

type State = {
  hasError: boolean
  uuid: string
  localImageSource: {exists:boolean, imageUrl:string|null}
}

export class PVFastImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      uuid: uuidv4(),
      localImageSource: {imageUrl: props.source || null, exists:false}
    }
  }

  async componentDidMount() {
    if(this.props.source) {
      const savedImageResults = await getSavedImageUri(this.props.source)
      if(savedImageResults.exists) {
        this.setState({localImageSource: savedImageResults})
      } else {
        downloadImageFile(this.props.source)
      }
    }
  }

  _handleError = () => {
    this.setState({ hasError: true })
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps?.source !== this.props.source) {
      this.setState({ hasError: false })
    }
  }

  render() {
    const { accessible = false, isSmall, resizeMode = 'contain', source, styles } = this.props
    const { hasError, uuid, localImageSource } = this.state
    const { offlineModeEnabled, userAgent } = this.global
    const cache = offlineModeEnabled ? 'cacheOnly' : 'immutable'
    let imageSource = source
    let isValid = false
    if (localImageSource.exists) {
      imageSource = "file://" + localImageSource.imageUrl
      isValid = true
    } else {
      isValid = isValidUrl(imageSource)
      
      /* Insecure images will not load on iOS, so force image URLs to https */
      if (Platform.OS === 'ios' && imageSource) {
        imageSource = imageSource.replace('http://', 'https://')
      }
    }
    const isSvg = imageSource && imageSource.endsWith('.svg')

    const image = isSvg ? (
      <View style={styles}>
        <SvgUri accessible={accessible} width='100%' height='100%' uri={imageSource || null} />
      </View>
    ) : (
      <FastImage
        accessible={accessible}
        fallback
        key={uuid}
        onError={this._handleError}
        resizeMode={resizeMode}
        source={{
          uri: imageSource,
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
