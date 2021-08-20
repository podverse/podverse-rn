import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
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
    const { globalTheme, player, screenPlayer } = this.global
    const { nowPlayingItem, playbackState } = player
    const { hasErrored } = screenPlayer
    const isDarkMode = globalTheme === darkTheme

    let playButtonAdjust = { paddingLeft: 2 } as any
    let playButtonIcon = (
      <Icon
        accessibilityHint={translate('ARIA - Tap to resume playing')}
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
          accessibilityHint={translate('ARIA - Tap to pause playback')}
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

    let nowPlayingAccessibilityLabel = `${translate('ARIA - Now playing')}. `
    nowPlayingAccessibilityLabel += `${nowPlayingItem.podcastTitle}. `
    nowPlayingAccessibilityLabel += `${nowPlayingItem.episodeTitle}.`

    return (
      <View>
        {nowPlayingItem && (
          <View style={[styles.playerInnerWrapper, globalTheme.player]}>
            <TouchableWithoutFeedback
              accessibilityLabel={nowPlayingAccessibilityLabel}
              accessibilityHint={translate('ARIA - Tap to open the full player screen')}
              onPress={() =>
                navigation.navigate(PV.RouteNames.PlayerScreen, {
                  nowPlayingItem,
                  addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl,
                  isDarkMode
                })
              }
              testID={testIDPrefix}>
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
                  <TextTicker
                    allowFontScaling={false}
                    bounce
                    loop
                    textLength={nowPlayingItem?.episodeTitle?.length}>
                    <Text
                      numberOfLines={1}
                      style={[styles.episodeTitle, globalTheme.playerText]}
                      testID={`${testIDPrefix}_episode_title`}>
                      {nowPlayingItem.episodeTitle}
                    </Text>
                  </TextTicker>
                </View>
              </View>
            </TouchableWithoutFeedback>
            <View>
              {!hasErrored && playButtonIcon}
              {hasErrored && (
                <Icon
                  accessible
                  accessibilityLabel={translate('ARIA - Error something went wrong with playing this item')}
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
