import { convertNowPlayingItemToMediaRef } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { TableSectionSelectors } from './TableSectionSelectors'
import { ClipInfoView, HTMLScrollView, ScrollView, View } from './'

type Props = {
  navigation?: any
  width: number
}

export class MediaPlayerCarouselShowNotes extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { navigation, width } = this.props
    const { player, screenPlayer } = this.global
    const { episode, nowPlayingItem } = player
    const { isLoading } = screenPlayer

    let { mediaRef } = player
    if (nowPlayingItem && nowPlayingItem.clipId) {
      mediaRef = convertNowPlayingItemToMediaRef(nowPlayingItem)
    }
    const showClipInfo = mediaRef?.id || nowPlayingItem?.clipId

    return (
      <ScrollView style={[styles.wrapper, { width }]} transparent>
        {!!showClipInfo && (
          <ClipInfoView
            createdAt={mediaRef.createdAt}
            endTime={mediaRef.endTime}
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
          <TableSectionSelectors
            disableFilter
            includePadding
            selectedFilterLabel={translate('Show Notes')}
          />
          {!isLoading && episode && (
            <HTMLScrollView
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              html={episode.description ? episode.description : ''}
              style={styles.htmlScrollView}
            />
          )}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {},
  clipTitle: {},
  headerText: {},
  htmlScrollView: {},
  showNotesTableSectionHeader: {
    marginBottom: 0
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
