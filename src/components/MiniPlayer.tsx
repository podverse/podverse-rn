import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { State as RNTPState } from 'react-native-track-player'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { checkIfStateIsBuffering } from '../services/player'
import { togglePlay } from '../state/actions/player'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { ActivityIndicator, FastImage, Icon, Text, TextTicker } from './'

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

    let playButtonAdjust = { paddingLeft: 2, paddingTop: 2 } as any
    let playButtonIcon = (
      <Icon
        accessibilityHint={translate('ARIA HINT - resume playing')}
        accessibilityLabel={translate('Play')}
        accessibilityRole='button'
        name='play'
        onPress={() => togglePlay(this.global)}
        size={20}
        testID={`${testIDPrefix}_play_button`}
        wrapperStyle={[playerStyles.icon, playButtonAdjust]} />
    )
    if (playbackState === RNTPState.Playing) {
      playButtonIcon = (
        <Icon
          accessibilityHint={translate('ARIA HINT - pause playback')}
          accessibilityLabel={translate('Pause')}
          accessibilityRole='button'
          name='pause'
          onPress={() => togglePlay(this.global)}
          size={20}
          testID={`${testIDPrefix}_pause_button`}
          wrapperStyle={[playerStyles.icon, playButtonAdjust]} />
      )
      playButtonAdjust = {}
    } else if (checkIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
    }

    let nowPlayingAccessibilityLabel = `${translate('ARIA HINT - Now playing')}. `
    nowPlayingAccessibilityLabel += `${nowPlayingItem.podcastTitle}. `
    nowPlayingAccessibilityLabel += `${nowPlayingItem.episodeTitle}.`

    const episodeTitleComponent = (
      <Text
        accessible={false}
        importantForAccessibility='no'
        numberOfLines={1}
        style={[styles.episodeTitle, globalTheme.playerText]}
        testID={`${testIDPrefix}_episode_title`}>
        {nowPlayingItem.episodeTitle}
      </Text>
    )

    return (
      <View>
        {nowPlayingItem && (
          <View style={[styles.playerInnerWrapper, globalTheme.player]}>
            <TouchableWithoutFeedback
              accessibilityLabel={nowPlayingAccessibilityLabel}
              accessibilityHint={translate('ARIA HINT - open the full player screen')}
              onPress={() =>
                navigation.navigate(PV.RouteNames.PlayerScreen, {
                  nowPlayingItem,
                  addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl,
                  isDarkMode
                })
              }
              testID={testIDPrefix.prependTestId()}>
              <View style={[styles.player, globalTheme.player]}>
                <FastImage
                  isSmall
                  resizeMode='contain'
                  source={nowPlayingItem.episodeImageUrl || nowPlayingItem.podcastImageUrl}
                  styles={styles.image}
                />
                <View style={styles.textWrapper}>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={[styles.podcastTitle, globalTheme.playerText]}
                    testID={`${testIDPrefix}_podcast_title`}>
                    {nowPlayingItem.podcastTitle}
                  </Text>
                  {
                    !screenReaderEnabled ? (
                      <TextTicker
                        accessible={false}
                        allowFontScaling={false}
                        bounce
                        importantForAccessibility='no-hide-descendants'
                        loop
                        textLength={nowPlayingItem?.episodeTitle?.length}>
                        {episodeTitleComponent}
                      </TextTicker>
                    ) : episodeTitleComponent
                  }
                </View>
              </View>
            </TouchableWithoutFeedback>
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
                  wrapperStyle={[playerStyles.icon, playButtonAdjust]} />
              )}
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  episodeTitle: {
    alignItems: 'center',
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 2
  },
  image: {
    height: 60,
    width: 60
  },
  player: {
    borderBottomWidth: 0,
    flex: 1,
    flexDirection: 'row',
    minHeight: 61
  },
  playerInnerWrapper: {
    borderTopWidth: 1,
    flexDirection: 'row'
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    marginTop: 2
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 10,
    marginRight: 2
  }
})
