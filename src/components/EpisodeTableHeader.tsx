import React from 'react'
import { StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, Icon, Text, View } from './'
import { MoreButton } from './MoreButton'

type Props = {
  downloadedEpisodeIds?: any
  downloadsActive?: any
  handleMorePress?: any
  id: string
  isLoading?: boolean
  isNotFound?: boolean
  podcastImageUrl?: string
  pubDate?: string
  title: string
}

export const EpisodeTableHeader = (props: Props) => {
  const {
    downloadedEpisodeIds = {},
    downloadsActive = {},
    handleMorePress,
    id,
    isLoading,
    isNotFound,
    podcastImageUrl,
    pubDate = '',
    title
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  const isDownloading = downloadsActive[id]
  const isDownloaded = downloadedEpisodeIds[id]

  return (
    <View style={styles.wrapper}>
      {isLoading && <ActivityIndicator />}
      {!isLoading && !isNotFound && (
        <View style={styles.innerWrapper}>
          <FastImage
            source={podcastImageUrl}
            styles={styles.image} />
          <View style={styles.textWrapper}>
            <Text numberOfLines={2} style={styles.title}>
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
          {handleMorePress &&
            <MoreButton
              handleShowMore={handleMorePress}
              height={92}
              isLoading={isDownloading} />
          }
        </View>
      )}
      {!isLoading && isNotFound && (
        <View style={core.view}>
          <Text style={styles.notFoundText}>Episode Not Found</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    flex: 0,
    marginLeft: 8,
    marginRight: 8
  },
  downloadedIcon: {
    flex: 0,
    marginLeft: 8,
    marginTop: 3
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
  },
  innerWrapper: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 8
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 6,
    paddingRight: 8,
    paddingTop: 8
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row',
    height: PV.Table.cells.podcast.wrapper.height
  }
})
