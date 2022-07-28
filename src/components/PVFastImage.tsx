import { Image, Platform, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SvgUri } from 'react-native-svg'
import React from 'reactn'
import { isValidUrl } from '../lib/utility'
import { downloadImageFile, getSavedImageUri } from '../lib/storage'
import { PV } from '../resources'
const uuidv4 = require('uuid/v4')
const PlaceholderImage = PV.Images.PLACEHOLDER.default

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

  componentDidMount() {
    this._loadImage()    
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps?.source !== this.props.source) {
      this._loadImage()
    }
  }

  _handleError = () => {
    this.setState({ hasError: true })
  }

  _loadImage = async () => {
    const { source } = this.props
    if (source) {
      const savedImageResults = await getSavedImageUri(source)
      if (savedImageResults.exists) {
        this.setState({ localImageSource: savedImageResults }, () => {
          (async () => {
            await downloadImageFile(source)
            const latestSavedImageResults = await getSavedImageUri(source)
            this.setState({ localImageSource: latestSavedImageResults })
          })
        })
      } else {
        downloadImageFile(source)
      }
    }
  }

  render() {
    const { accessible = false, resizeMode = 'contain', source, styles } = this.props
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
          <View style={styles}>
            <PlaceholderImage accessible={accessible} width='100%' height='100%' />
          </View>
        )}
      </>
    )
  }
}
