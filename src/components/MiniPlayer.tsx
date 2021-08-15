import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { State as RNTPState } from 'react-native-track-player'
import React from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { checkIfStateIsBuffering, PVTrackPlayer } from '../services/player'
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

    let playButtonIcon = <Icon name='play' size={20} testID={`${testIDPrefix}_play_button`} />
    let playButtonAdjust = { paddingLeft: 2 } as any
    if (playbackState === RNTPState.Playing) {
      playButtonIcon = <Icon name='pause' size={20} testID={`${testIDPrefix}_pause_button`} />
      playButtonAdjust = {}
    } else if (checkIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
    }

    return (
      <View>
        {nowPlayingItem && (
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate(PV.RouteNames.PlayerScreen, {
                nowPlayingItem,
                addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl,
                isDarkMode
              })
            }
            {...testProps(testIDPrefix)}>
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
                    {...testProps(`${testIDPrefix}_episode_title`)}>
                    {nowPlayingItem.episodeTitle}
                  </Text>
                </TextTicker>
              </View>
              <TouchableOpacity
                onPress={() => togglePlay(this.global)}
                style={[playerStyles.icon, playButtonAdjust]}
                {...testProps(`${testIDPrefix}_toggle_play_button`)}>
                {!hasErrored && playButtonIcon}
                {hasErrored && (
                  <Icon
                    color={globalTheme === darkTheme ? iconStyles.lightRed.color : iconStyles.darkRed.color}
                    name={'exclamation-triangle'}
                    size={26}
                    testID={`${testIDPrefix}_error`}
                  />
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
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
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 61
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
