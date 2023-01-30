import { convertNowPlayingItemToMediaRef } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { TableSectionSelectors } from './TableSectionSelectors'
import { ClipInfoView, HTMLScrollView, ScrollView, Text, TextLink, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {
  showShortHtml?: boolean
}

const testIDPrefix = 'media_player_carousel_show_notes'

export class MediaPlayerCarouselShowNotes extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      showShortHtml: true
    }
  }

  toggleShortHtml() {
    const { showShortHtml } = this.state
    this.setState({ showShortHtml: !showShortHtml })
  }

  render() {
    const { navigation, width } = this.props
    const { showShortHtml } = this.state
    const { player, screenPlayer, screenReaderEnabled } = this.global
    const { episode, nowPlayingItem } = player
    const { isLoading } = screenPlayer

    let { mediaRef } = player
    if (nowPlayingItem && nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }
    const showClipInfo = mediaRef?.id || nowPlayingItem?.clipId

    const html = episode.description ? episode.description : ''
    const hasLongHtml = html.length > 500

    return (
      <ScrollView style={[styles.wrapper, { width }]} transparent>
        {!!showClipInfo && !screenReaderEnabled && (
          <ClipInfoView
            createdAt={mediaRef.createdAt}
            endTime={mediaRef.endTime}
            episodeTitle={episode.title}
            isLoading={isLoading}
            isOfficialChapter={mediaRef.isOfficialChapter}
            isOfficialSoundBite={mediaRef.isOfficialSoundBite}
            isPublic={mediaRef.isPublic}
            navigation={navigation}
            {...(mediaRef.owner ? { ownerId: mediaRef.owner.id } : {})}
            {...(mediaRef.owner ? { ownerIsPublic: mediaRef.owner.isPublic } : {})}
            {...(mediaRef.owner ? { ownerName: mediaRef.owner.name } : {})}
            startTime={mediaRef.startTime}
            {...(mediaRef.title ? { title: mediaRef.title } : {})}
          />
        )}
        <View style={styles.showNotesWrapper} transparent>
          <TableSectionSelectors disableFilter includePadding selectedFilterLabel={translate('Episode Summary')} />
          {!isLoading && episode && (
            <View>
              {(episode?.liveItem?.start || episode?.pubDate) && (
                <Text
                  accessibilityHint={translate('ARIA HINT - This is the episode publication date')}
                  accessibilityLabel={readableDate(episode?.liveItem?.start || episode.pubDate)}
                  style={styles.episodePubDate}
                  testID={`${testIDPrefix}_episode_pub_date`}>
                  {readableDate(episode?.liveItem?.start || episode.pubDate)}
                </Text>
              )}
              <HTMLScrollView
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                html={html}
                showShortHtml={!!hasLongHtml && showShortHtml}
                style={styles.htmlScrollView}
              />
            </View>
          )}
        </View>
        {!!hasLongHtml && (
          <View style={styles.showMoreWrapper}>
            <TextLink
              onPress={() => this.toggleShortHtml()}
              style={styles.showMoreTextLink}
              testID={`${testIDPrefix}_show_more`}
              text={!!showShortHtml ? translate('Show more') : translate('Show less')}
            />
          </View>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {},
  clipTitle: {},
  episodePubDate: {
    marginBottom: 16,
    marginHorizontal: 8,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  headerText: {},
  htmlScrollView: {},
  showNotesTableSectionHeader: {
    marginBottom: 0
  },
  showMoreWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 4
  },
  showMoreTextLink: {
    fontSize: PV.Fonts.sizes.xl,
    padding: 12
  },
  showNotesWrapper: {
    flex: 1
  },
  text: {
    color: 'black',
    flex: 0,
    fontSize: 32
  },
  wrapper: {
    flex: 1
  }
})
