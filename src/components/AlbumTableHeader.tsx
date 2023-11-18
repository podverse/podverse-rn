import { Author, Episode, Podcast, ValueTag, generateAuthorsText } from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import React, { useGlobal } from 'reactn'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, Icon, SettingsButton, SubscribeButton, Text, View } from './'

type Props = {
  addByRSSPodcastFeedUrl?: string
  authors: Author[]
  description?: string
  episodes: Episode[]
  handleNavigateToPodcastInfoScreen?: any
  handleToggleAutoDownload?: any
  handleToggleSettings?: any
  handleToggleSubscribe?: any
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  podcast: Podcast
  podcastImageUrl?: string
  podcastTitle: string
  podcastValue: ValueTag[]
  showSettings?: boolean
  testID: string
}

const downloadAllTracks = (episodes: Episode[], podcast: Podcast,
  downloadedEpisodeIds: string[], downloadsActive: string[]) => {
  if (!episodes || episodes.length === 0) return
  for (const episode of episodes) {
    const episodeId = episode?.id
    const episodeDownloaded = !!(episodeId && !!downloadedEpisodeIds[episodeId])
    const episodeDownloading = !!(episodeId && !!downloadsActive[episodeId])
    if (!episodeDownloaded && !episodeDownloading) {
      downloadEpisode(episode, podcast)
    }
  }
}

export const AlbumTableHeader = (props: Props) => {
  const {
    addByRSSPodcastFeedUrl,
    authors = [],
    episodes,
    handleToggleSettings,
    handleToggleSubscribe,
    isLoading,
    isNotFound,
    isSubscribed,
    isSubscribing,
    podcast,
    podcastImageUrl,
    podcastTitle = translate('Untitled Podcast'),
    podcastValue,
    showSettings,
    testID
  } = props
  const [downloadedEpisodeIds] = useGlobal('downloadedEpisodeIds')
  const [downloadsActive] = useGlobal('downloadsActive')
  const titleNumberOfLines = 1
  const authorNames = generateAuthorsText(authors)

  return (
    <View style={core.row}>
      {isLoading && (
        <View style={[styles.wrapper, core.view]}>
          <ActivityIndicator fillSpace testID={testID} />
        </View>
      )}
      {!isLoading && (
        <View style={{ flexDirection: 'column', flex: 1 }}>
          {!isNotFound && (
            <View style={styles.wrapper}>
              <FastImage
                allowFullView
                isAddByRSSPodcast={!!addByRSSPodcastFeedUrl}
                source={podcastImageUrl}
                styles={styles.image}
                valueTags={podcastValue}
              />
              <View style={styles.contentWrapper}>
                <View style={styles.contentWrapperTop}>
                  <RNView style={styles.contentWrapperTopText}>
                    <Text
                      accessibilityHint={translate('ARIA HINT - This is the podcast title')}
                      accessibilityLabel={podcastTitle}
                      fontSizeLargestScale={PV.Fonts.largeSizes.md}
                      numberOfLines={titleNumberOfLines}
                      selectable
                      style={styles.title}>
                      {podcastTitle}
                    </Text>
                    <Text isSecondary style={styles.authorNames} numberOfLines={1}>
                      {authorNames}
                    </Text>
                  </RNView>
                  {isSubscribed && (
                    <SettingsButton
                      accessibilityHint={
                        showSettings
                          ? // eslint-disable-next-line max-len
                            translate(
                              'ARIA HINT - On tap settings will hide and episodes will appear lower on this screen'
                            )
                          : // eslint-disable-next-line max-len
                            translate(
                              'ARIA HINT - On tap the episodes will hide and settings will appear lower on this screen'
                            )
                      }
                      accessibilityLabel={
                        showSettings
                          ? translate('ARIA HINT - Hide podcast settings')
                          : translate('ARIA HINT - Show podcast settings')
                      }
                      handleToggleSettings={handleToggleSettings}
                      showCheckmark={showSettings}
                      testID={`${testID}_settings`}
                    />
                  )}
                </View>
                <View style={styles.contentWrapperBottom}>
                  <SubscribeButton
                    handleToggleSubscribe={handleToggleSubscribe}
                    isSubscribed={isSubscribed}
                    isSubscribing={isSubscribing}
                    testID={testID}
                  />
                  <Icon
                    accessibilityHint={translate('ARIA HINT - download this album')}
                    accessibilityLabel={translate('Download')}
                    accessibilityRole='button'
                    color={PV.Colors.white}
                    name='download'
                    onPress={() => {
                      downloadAllTracks(episodes, podcast, downloadedEpisodeIds, downloadsActive)
                    }}
                    size={21}
                    style={styles.downloadButton}
                    testID={`${testID}_download_button_icon`}
                  />
                </View>
              </View>
            </View>
          )}
          {isNotFound && (
            <View style={[styles.wrapper, core.view]}>
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.title}>
                {translate('Music - Album not found')}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 0,
    flexDirection: 'row',
    minHeight: PV.Table.cells.album.wrapper.height,
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor: PV.Colors.velvet,
    width: '100%'
  },
  image: {
    height: PV.Table.cells.album.image.height,
    width: PV.Table.cells.album.image.width,
    marginRight: 16
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  contentWrapperTopText: {
    flexDirection: 'column',
    flex: 1
  },
  contentWrapperBottom: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  contentWrapperTop: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  authorNames: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    color: PV.Colors.skyLight,
    marginTop: 4
  },
  downloadButton: {
    height: 36,
    lineHeight: 36,
    width: 36,
    textAlign: 'center'
  }
})
