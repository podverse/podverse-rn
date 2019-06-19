import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { DownloadStatus } from '../lib/downloader'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button, core } from '../styles'
import { ActivityIndicator, Icon, Text, View } from './'

type Props = {
  downloadedEpisodeIds?: any
  downloads?: any
  handleMorePress?: any
  id?: string
  isLoading?: boolean
  isNotFound?: boolean
  podcastImageUrl?: string
  pubDate?: string
  title: string
}

export const EpisodeTableHeader = (props: Props) => {
  const { downloadedEpisodeIds, downloads, handleMorePress, id, isLoading, isNotFound, podcastImageUrl,
    pubDate = '', title } = props
  const [globalTheme] = useGlobal('globalTheme')

  let isDownloading = false
  const downloadingEpisode = downloads.find((x: any) => x.episodeId === id)

  if (downloadingEpisode && (downloadingEpisode.status === DownloadStatus.DOWNLOADING ||
    downloadingEpisode.status === DownloadStatus.PAUSED)) {
    isDownloading = true
  }

  const isDownloaded = downloadedEpisodeIds.some((x: any) => x === id)

  return (
    <View style={styles.wrapper}>
      {
        isLoading && <ActivityIndicator />
      }
      {
        !isLoading && !isNotFound &&
          <View style={styles.innerWrapper}>
            <Image
              source={{ uri: podcastImageUrl }}
              style={styles.image} />
            <View style={styles.textWrapper}>
              <Text
                numberOfLines={3}
                style={styles.title}>
                {title}
              </Text>
              <View style={styles.textWrapperBottomRow}>
                <Text
                  isSecondary={true}
                  style={styles.pubDate}>
                  {readableDate(pubDate)}
                </Text>
                {
                  isDownloaded &&
                    <Icon
                      isSecondary={true}
                      name='download'
                      size={15}
                      style={styles.downloadedIcon} />
                }
              </View>
            </View>
            {
              !isDownloading && handleMorePress &&
                <View style={styles.buttonView}>
                  <TouchableOpacity
                    onPress={handleMorePress}
                    style={styles.moreButton}>
                    <Image
                      resizeMode='contain'
                      source={PV.Images.MORE}
                      style={[styles.moreButtonImage, globalTheme.buttonImage]} />
                  </TouchableOpacity>
                </View>
            }
          {
            isDownloading &&
              <ActivityIndicator
                onPress={handleMorePress}
                styles={button.iconOnlyMedium} />
          }
          </View>
      }
      {
        !isLoading && isNotFound &&
          <View style={core.view}>
            <Text style={styles.notFoundText}>Episode Not Found</Text>
          </View>
      }
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
    marginLeft: 12,
    marginTop: 3
  },
  image: {
    flex: 0,
    height: 92,
    marginRight: 12,
    width: 92
  },
  innerWrapper: {
    flex: 1,
    flexDirection: 'row'
  },
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  moreButtonImage: {
    borderColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
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
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row',
    height: 92
  }
})
