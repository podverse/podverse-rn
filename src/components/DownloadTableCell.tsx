import React from 'react'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Slider } from 'react-native-elements'
import { PV } from '../resources'
import { getDownloadStatusText } from '../state/actions/downloads'
import { FastImage, Text, View } from './'

type Props = {
  bytesTotal: string
  bytesWritten: string
  completed?: boolean
  episodeTitle: string
  onPress?: any
  percent: number
  podcastImageUrl?: string
  podcastTitle: string
  status?: string
}

export class DownloadTableCell extends React.PureComponent<Props> {
  render() {
    const {
      bytesTotal = '---',
      bytesWritten = '---',
      completed,
      episodeTitle = 'Untitled episode',
      onPress,
      percent,
      podcastImageUrl = PV.Images.SQUARE_PLACEHOLDER,
      podcastTitle = 'Untitled podcast',
      status
    } = this.props
    const per = completed ? 1 : percent
    const statusText = getDownloadStatusText(status)

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.wrapper}>
          <FastImage
            source={podcastImageUrl}
            styles={styles.image} />
          <View style={styles.textWrapper}>
            <View style={styles.textWrapperTop}>
              <Text numberOfLines={1} style={styles.episodeTitle}>
                {episodeTitle}
              </Text>
              <Text
                isSecondary={true}
                numberOfLines={1}
                style={styles.podcastTitle}>
                {podcastTitle}
              </Text>
            </View>
            <View style={styles.textWrapperBottom}>
              <Slider
                minimumValue={0}
                maximumValue={1}
                style={styles.slider}
                thumbStyle={{ height: 0, width: 0 }}
                thumbTouchSize={{ height: 0, width: 0 }}
                value={per}
              />
              <View style={styles.textWrapperBottomText}>
                <Text>{statusText}</Text>
                {completed ? (
                  <Text>{bytesTotal}</Text>
                ) : (
                  <Text>{`${bytesWritten} / ${bytesTotal}`}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  episodeTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: PV.Fonts.sizes.md,
    marginTop: 2
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 1
  },
  slider: {
    height: 4
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 4,
    paddingRight: 8,
    paddingTop: 6
  },
  textWrapperBottom: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  textWrapperTop: {
    flex: 1
  },
  textWrapperBottomText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  thumbStyle: {
    display: 'none'
  },
  wrapper: {
    flexDirection: 'row',
    height: PV.Table.cells.podcast.image.height
  }
})
