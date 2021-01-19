import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { Slider } from 'react-native-elements'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { getDownloadStatusText } from '../state/actions/downloads'
import { FastImage, Text, View } from './'

type Props = {
  bytesTotal: string
  bytesWritten: string
  completed?: boolean
  episodeTitle?: string
  hasZebraStripe?: boolean
  onPress?: any
  percent: number
  podcastImageUrl?: string
  podcastTitle?: string
  status?: string
  testID: string
}

export class DownloadTableCell extends React.PureComponent<Props> {
  render() {
    const {
      bytesTotal = '---',
      bytesWritten = '---',
      completed,
      episodeTitle = translate('Untitled Episode'),
      hasZebraStripe,
      onPress,
      percent,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      status,
      testID
    } = this.props
    const per = completed ? 1 : percent
    const statusText = getDownloadStatusText(status)

    return (
      <TouchableWithoutFeedback onPress={onPress} {...(testID ? testProps(testID) : {})}>
        <View hasZebraStripe={hasZebraStripe} style={styles.wrapper}>
          <FastImage source={podcastImageUrl} styles={styles.image} />
          <RNView style={styles.textWrapper}>
            <RNView style={styles.textWrapperTop}>
              {episodeTitle && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={styles.episodeTitle}
                  testID={`${testID}_episode_title`}>
                  {episodeTitle.trim()}
                </Text>
              )}
              {podcastTitle && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.podcastTitle}
                  testID={`${testID}_podcast_title`}>
                  {podcastTitle.trim()}
                </Text>
              )}
            </RNView>
            <RNView style={styles.textWrapperBottom}>
              <Slider
                minimumValue={0}
                maximumValue={1}
                style={styles.slider}
                thumbStyle={{ height: 0, width: 0 }}
                thumbTouchSize={{ height: 0, width: 0 }}
                value={per}
              />
              <RNView style={styles.textWrapperBottomText}>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} testID={`${testID}_status_text`}>
                  {statusText}
                </Text>
                {completed ? (
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} testID={`${testID}_bytes_total`}>
                    {bytesTotal}
                  </Text>
                ) : (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.xs}
                    testID={`${testID}_bytes_written`}>{`${bytesWritten} / ${bytesTotal}`}</Text>
                )}
              </RNView>
            </RNView>
          </RNView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  episodeTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm
  },
  slider: {
    height: 4,
    marginTop: 4
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 4,
    paddingRight: 8
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
    flexDirection: 'row'
  }
})
