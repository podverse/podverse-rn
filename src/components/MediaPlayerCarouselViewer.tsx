import { StyleSheet } from 'react-native'
import React from 'reactn'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {}

export class MediaPlayerCarouselViewer extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { width } = this.props
    const { player } = this.global
    const { nowPlayingItem } = player
    const { clipEndTime, clipId, clipStartTime, clipTitle, podcastImageUrl } = nowPlayingItem

    return (
      <View style={[styles.wrapper, { width }]} transparent={true}>
        <FastImage key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
        {clipId && (
          <View style={styles.clipWrapper}>
            <Text style={styles.clipTitle} testID='media_player_carousel_viewer_title'>{`${clipTitle}`}</Text>
            <Text style={styles.clipTime} testID='media_player_carousel_viewer_time'>
              {readableClipTime(clipStartTime, clipEndTime)}
            </Text>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 6
  },
  clipTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.semibold
  },
  clipWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    bottom: 1,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    right: 0
  },
  image: {
    flex: 1
  },
  wrapper: {
    flex: 1,
    padding: 24
  }
})
