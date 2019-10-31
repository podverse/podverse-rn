import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button, core } from '../styles'
import { ActivityIndicator, Icon, Text, View } from './'

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
          <FastImage source={{ uri: podcastImageUrl }} style={styles.image} />
          <View style={styles.textWrapper}>
            <Text numberOfLines={3} style={styles.title}>
              {title}
            </Text>
            <View style={styles.textWrapperBottomRow}>
              <Text isSecondary={true} style={styles.pubDate}>
                {readableDate(pubDate)}
              </Text>
              {isDownloaded && (
                <Icon
                  isSecondary={true}
                  name="download"
                  size={13}
                  style={styles.downloadedIcon}
                />
              )}
            </View>
          </View>
          {!isDownloading && handleMorePress && (
            <View style={styles.buttonView}>
              <TouchableOpacity
                onPress={handleMorePress}
                style={styles.moreButton}>
                <Image
                  resizeMode="contain"
                  source={PV.Images.MORE}
                  style={[styles.moreButtonImage, globalTheme.buttonImage]}
                />
              </TouchableOpacity>
            </View>
          )}
          {isDownloading && (
            <View style={styles.moreButton}>
              <ActivityIndicator
                onPress={handleMorePress}
                styles={button.iconOnlyMedium}
              />
            </View>
          )}
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
    flexDirection: 'row'
  },
  moreButton: {
    alignItems: 'center',
    flex: 0,
    height: 44,
    justifyContent: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
    width: 44
  },
  moreButtonImage: {
    height: 36,
    tintColor: 'white',
    width: 36
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    lineHeight: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 5,
    paddingRight: 8,
    paddingTop: 6
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: PV.Fonts.sizes.lg + 2
  },
  wrapper: {
    flexDirection: 'row',
    height: PV.Table.cells.podcast.wrapper.height
  }
})
