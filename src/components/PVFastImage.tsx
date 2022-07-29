import { Image, Platform, StyleSheet, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import React from 'reactn'
import { isValidUrl } from '../lib/utility'
import { downloadImageFile, getSavedImageUri } from '../lib/storage'
import { PV } from '../resources'
import { NewContentBadge, Text } from '.'
const PlaceholderImage = PV.Images.PLACEHOLDER.default

type Props = {
  accessible?: boolean
  cache?: string
  isSmall?: boolean
  newContentCount?: number
  placeholderLabel?: string
  resizeMode?: any
  styles?: any
  source?: string
}

type State = {
  hasError: boolean
  localImageSource: {exists:boolean, imageUrl:string|null}
}

export class PVFastImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
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
          })()
        })
      } else {
        await downloadImageFile(source)
        const savedImageResults = await getSavedImageUri(source)
        this.setState({ localImageSource: savedImageResults })
      }
    }
  }

  render() {
    const {
      accessible = false,
      newContentCount,
      placeholderLabel,
      resizeMode = 'contain', source,
      styles
    } = this.props
    const { hasError, localImageSource } = this.state
    const { hideNewEpisodesBadges, userAgent } = this.global
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
      <View style={styles}>
        <Image
          accessible={accessible}
          onError={this._handleError}
          resizeMode={resizeMode}
          source={{
            uri: imageSource,
            headers: {
              ...(userAgent ? { 'User-Agent': userAgent } : {})
            }
          }}
          style={{ height: '100%', width: '100%' }}
        />
        {!hideNewEpisodesBadges && !!newContentCount && newContentCount > 0 && (
          <NewContentBadge count={newContentCount} />
        )}
      </View>
    )

    return (
      <>
        {isValid && !hasError ? (
          image
        ) : (
          <View style={styles}>
            <PlaceholderImage accessible={accessible} width='100%' height='100%' />
            {
              !!placeholderLabel && (
                <View style={defaultStyles.placeholderWrapper}>
                  <Text style={defaultStyles.placeholderLabel}>{placeholderLabel}</Text>
                </View>
              )
            }
          </View>
        )}
      </>
    )
  }
}

const defaultStyles = StyleSheet.create({
  placeholderLabel: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    padding: 2,
    textAlign: 'center'
  },
  placeholderWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0
  }
})
