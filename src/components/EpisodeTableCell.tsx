import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'reactn'
import {
  decodeHTMLString,
  readableDate,
  removeHTMLFromString
} from '../lib/utility'
import { PV } from '../resources'
import { FastImage, Icon, Text, View } from './'
import { MoreButton } from './MoreButton'

type Props = {
  description?: string
  handleMorePress?: any
  handleNavigationPress?: any
  hideImage?: boolean
  id: string
  podcastImageUrl?: string
  podcastTitle?: string
  pubDate?: string
  title?: string
}

export class EpisodeTableCell extends React.PureComponent<Props> {
  render() {
    const {
      id,
      pubDate = '',
      handleMorePress,
      handleNavigationPress,
      hideImage,
      podcastImageUrl,
      podcastTitle
    } = this.props
    let { description = '', title } = this.props
    description = removeHTMLFromString(description)
    description = decodeHTMLString(description)

    const { downloadedEpisodeIds, downloadsActive } = this.global

    const isDownloading = downloadsActive[id]
    const isDownloaded = downloadedEpisodeIds[id]

    if (!title) title = 'untitled episode'

    const innerTopView = (
      <View style={styles.innerTopView}>
        {!!podcastImageUrl && (
            <FastImage
              isSmall={true}
              source={podcastImageUrl}
              styles={styles.image} />
        )}
        <View style={styles.textWrapper}>
          {!!podcastTitle && (
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle}
            </Text>
          )}
          <Text numberOfLines={6} style={styles.title}>
            {title}
          </Text>
          <View style={styles.textWrapperBottomRow}>
            <Text isSecondary={true} style={styles.pubDate}>
              {readableDate(pubDate)}
            </Text>
            {isDownloaded && (
              <Icon
                isSecondary={true}
                name='download'
                size={13}
                style={styles.downloadedIcon}
              />
            )}
          </View>
        </View>
      </View>
    )

    const descriptionStyle = hideImage ? [styles.description, { paddingLeft: 0 }] : styles.description

    const bottomText = (
      <Text
        isSecondary={true}
        numberOfLines={4}
        style={descriptionStyle}>
        {description}
      </Text>
    )

    return (
      <View style={styles.wrapper}>
        <View style={styles.wrapperTop}>
          {handleNavigationPress ? (
            <TouchableWithoutFeedback onPress={handleNavigationPress}>
              {innerTopView}
            </TouchableWithoutFeedback>
          ) : (
            innerTopView
          )}
          {handleMorePress &&
            <MoreButton
              handleShowMore={handleMorePress}
              height={hideImage ? 46 : 64}
              isLoading={isDownloading} />
          }
        </View>
        {!!description && handleNavigationPress && (
          <TouchableWithoutFeedback onPress={handleNavigationPress}>
            {bottomText}
          </TouchableWithoutFeedback>
        )}
        {!!description && !handleNavigationPress && bottomText}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: PV.Fonts.sizes.md,
    lineHeight: PV.Fonts.sizes.md + 2,
    marginTop: 10,
    paddingLeft: 76
  },
  downloadedIcon: {
    flex: 0,
    marginLeft: 8,
    marginTop: 3
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
  },
  innerTopView: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 4
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-start',
    lineHeight: PV.Fonts.sizes.md,
    marginTop: 1
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    lineHeight: PV.Fonts.sizes.sm,
    marginTop: 7
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 3
  },
  wrapper: {
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 16
  },
  wrapperTop: {
    flexDirection: 'row'
  }
})
