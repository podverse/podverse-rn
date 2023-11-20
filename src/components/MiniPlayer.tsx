import { checkIfVideoFileOrVideoLiveType, generateAuthorsText } from 'podverse-shared'
import { Pressable, StyleSheet, View } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { playerCheckIfStateIsBuffering, playerCheckIfStateIsPlaying } from '../services/player'
import { handleNavigateToPlayerScreen, playerTogglePlay } from '../state/actions/player'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { ActivityIndicator, FastImage, Icon, PVVideo, Text, TextTicker } from './'

type Props = {
  navigation: any
}

const testIDPrefix = 'mini_player'

export class MiniPlayer extends React.PureComponent<Props> {
  render() {
    const { navigation } = this.props
    const { globalTheme, player, screenPlayer, screenReaderEnabled } = this.global
    const { playbackState } = player
    const { hasErrored } = screenPlayer
    const isDarkMode = globalTheme === darkTheme

    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}
    const isMusic = nowPlayingItem?.podcastMedium === PV.Medium.music
    const podcastTitle = isMusic
      ? generateAuthorsText(nowPlayingItem.podcastAuthors)
      : nowPlayingItem?.podcastTitle

    let playButtonAdjust = { paddingLeft: 2, paddingTop: 2 } as any
    let playButtonIcon = (
      <Icon
        accessibilityHint={translate('ARIA HINT - resume playing')}
        accessibilityLabel={translate('Play')}
        accessibilityRole='button'
        name='play'
        onPress={() => playerTogglePlay()}
        size={20}
        testID={`${testIDPrefix}_play_button`}
        wrapperStyle={[playerStyles.icon, playButtonAdjust]}
      />
    )
    if (playerCheckIfStateIsPlaying(playbackState)) {
      playButtonIcon = (
        <Icon
          accessibilityHint={translate('ARIA HINT - pause playback')}
          accessibilityLabel={translate('Pause')}
          accessibilityRole='button'
          name='pause'
          onPress={() => playerTogglePlay()}
          size={20}
          testID={`${testIDPrefix}_pause_button`}
          wrapperStyle={[playerStyles.icon, playButtonAdjust]}
        />
      )
      playButtonAdjust = {}
    } else if (playerCheckIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
    }

    let nowPlayingAccessibilityLabel = `${translate('ARIA HINT - Now playing')}. `
    nowPlayingAccessibilityLabel += `${podcastTitle}. `
    nowPlayingAccessibilityLabel += `${nowPlayingItem?.episodeTitle}.`

    const episodeTitleComponent = (
      <Text
        accessible={false}
        importantForAccessibility='no'
        numberOfLines={1}
        style={[styles.episodeTitle, globalTheme.playerText]}
        testID={`${testIDPrefix}_episode_title`}>
        {nowPlayingItem?.episodeTitle}
      </Text>
    )

    // const { clipEndTime, clipStartTime, clipTitle } = nowPlayingItem
    // const useTo = false
    // const finalClipTitle = `${clipTitle} ${readableClipTime(clipStartTime, clipEndTime, useTo)}`
    // const clipTitleComponent = (
    //   <Text
    //     accessible={false}
    //     importantForAccessibility='no'
    //     isSecondary
    //     numberOfLines={1}
    //     style={[styles.clipTitle, globalTheme.playerText]}
    //     testID={`${testIDPrefix}_clip_title`}>
    //     {finalClipTitle}
    //   </Text>
    // )

    // const clipTitleWrapperStyle = [styles.clipTitleWrapper, globalTheme.player]

    return (
      <View>
        {/* {
          screenReaderEnabled ? (
            <View style={clipTitleWrapperStyle}>
              <TextTicker
                accessible={false}
                allowFontScaling={false}
                bounce
                importantForAccessibility='no-hide-descendants'
                loop
                styles={styles.clipTitle}
                textLength={nowPlayingItem?.clipTitle?.length}>
                {clipTitleComponent}
              </TextTicker>
            </View>
          ) : (
            <View style={clipTitleWrapperStyle}>
              {clipTitleComponent}
            </View>
          )
        } */}
        {nowPlayingItem && (
          <View style={[styles.playerInnerWrapper, globalTheme.player]}>
            <Pressable
              accessibilityLabel={nowPlayingAccessibilityLabel}
              accessibilityHint={translate('ARIA HINT - open the full player screen')}
              onPress={() => {
                handleNavigateToPlayerScreen(
                  navigation,
                  nowPlayingItem,
                  nowPlayingItem?.addByRSSPodcastFeedUrl,
                  isDarkMode
                )
              }}
              style={{ flex: 1 }}
              testID={testIDPrefix.prependTestId()}>
              <View style={[styles.player, globalTheme.player]}>
                {!!checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType) && (
                  <View style={styles.image}>
                    <PVVideo isMiniPlayer navigation={navigation} />
                  </View>
                )}
                {!checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType) && (
                  <FastImage
                    isSmall
                    resizeMode='contain'
                    source={
                      nowPlayingItem.episodeImageUrl ||
                      nowPlayingItem.podcastShrunkImageUrl ||
                      nowPlayingItem.podcastImageUrl
                    }
                    styles={styles.image}
                  />
                )}
                <View style={styles.textWrapper}>
                  {!screenReaderEnabled ? (
                    <TextTicker
                      accessible={false}
                      allowFontScaling={false}
                      bounce
                      importantForAccessibility='no-hide-descendants'
                      loop
                      styles={styles.episodeTitle}
                      textLength={nowPlayingItem?.episodeTitle?.length}>
                      {episodeTitleComponent}
                    </TextTicker>
                  ) : (
                    episodeTitleComponent
                  )}
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={[globalTheme.playerText, styles.podcastTitle]}
                    testID={`${testIDPrefix}_podcast_title`}>
                    {podcastTitle}
                  </Text>
                </View>
              </View>
            </Pressable>
            <View style={{ flex: 0, justifyContent: 'center', height: 60, width: 60 }}>
              {!hasErrored && playButtonIcon}
              {hasErrored && (
                <Icon
                  accessible
                  accessibilityLabel={translate('ARIA HINT - Error something went wrong with playing this item')}
                  color={globalTheme === darkTheme ? iconStyles.lightRed.color : iconStyles.darkRed.color}
                  name={'exclamation-triangle'}
                  size={26}
                  testID={`${testIDPrefix}_error`}
                  wrapperStyle={[playerStyles.icon, playButtonAdjust]}
                />
              )}
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  clipTitle: {
    fontSize: PV.Fonts.sizes.xl
    // fontWeight: PV.Fonts.weights.semibold,
  },
  clipTitleWrapper: {
    borderTopWidth: 1,
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 6,
    flexShrink: 1,
  },
  image: {
    height: 60,
    width: 60
  },
  player: {
    borderBottomWidth: 0,
    flex: 1,
    flexDirection: 'row'
  },
  playerInnerWrapper: {
    borderTopWidth: 1,
    flexDirection: 'row'
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    flexShrink: 1,
    color: PV.Colors.skyLight,
    marginTop: 5,
    flexWrap: 'wrap'
  },
  textWrapper: {
    flex: 1,
    marginLeft: 10
  }
})
