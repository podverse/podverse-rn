import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React from 'reactn'
import { PV } from '../resources'
import { PVTrackPlayer } from '../services/player'
import { togglePlay } from '../state/actions/player'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { FastImage, Text } from './'

type Props = {
  navigation: any
}

type State = {}

export class MiniPlayer extends React.PureComponent<Props, State> {
  render() {
    const { navigation } = this.props
    const { fontScaleMode, globalTheme, player, screenPlayer } = this.global
    const { nowPlayingItem, playbackState } = player
    const { hasErrored } = screenPlayer
    const isDarkMode = globalTheme === darkTheme

    return (
      <View>
        {nowPlayingItem && (
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate(PV.RouteNames.PlayerScreen, {
                nowPlayingItem,
                addByRSSPodcastFeedUrl: nowPlayingItem.addByRSSPodcastFeedUrl
              })
            }>
            <View style={[styles.player, globalTheme.player]}>
              <FastImage
                isSmall={true}
                resizeMode='contain'
                source={nowPlayingItem.podcastImageUrl}
                styles={styles.image}
              />
              <View style={styles.textWrapper}>
                {
                  ![PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode) &&
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.xl}
                      numberOfLines={1}
                      style={[styles.podcastTitle, globalTheme.playerText]}>
                      {nowPlayingItem.podcastTitle}
                    </Text>
                }
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.xl}
                  numberOfLines={1}
                  style={[styles.episodeTitle, globalTheme.playerText]}>
                  {nowPlayingItem.episodeTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => togglePlay(this.global)}
                style={playerStyles.icon}>
                {!hasErrored && (
                  <Icon
                    color={
                      isDarkMode
                        ? iconStyles.dark.color
                        : iconStyles.light.color
                    }
                    name={
                      playbackState === PVTrackPlayer.STATE_PLAYING
                        ? 'pause'
                        : 'play'
                    }
                    size={30}
                  />
                )}
                {hasErrored && (
                  <Icon
                    color={
                      globalTheme === darkTheme
                        ? iconStyles.lightRed.color
                        : iconStyles.darkRed.color
                    }
                    name={'exclamation-triangle'}
                    size={26}
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
