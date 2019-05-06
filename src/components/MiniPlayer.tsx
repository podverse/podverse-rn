import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback,
  View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React from 'reactn'
import { PV } from '../resources'
import { PVTrackPlayer, togglePlay } from '../services/player'
import { darkTheme, iconStyles } from '../styles'

type Props = {
  navigation: any
}

type State = {}

export class MiniPlayer extends React.PureComponent<Props, State> {

  render () {
    const { navigation } = this.props
    const { globalTheme, player } = this.global
    const { nowPlayingItem, playbackState } = player
    const isDarkMode = globalTheme === darkTheme

    return (
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate(PV.RouteNames.PlayerScreen, { nowPlayingItem })}>
        <View style={[styles.player, globalTheme.player]}>
          <Image
            resizeMode='contain'
            source={{ uri: nowPlayingItem.podcastImageUrl }}
            style={styles.image} />
          <View style={styles.textWrapper}>
            <Text
              numberOfLines={1}
              style={[styles.podcastTitle, globalTheme.playerText]}>
              {nowPlayingItem.podcastTitle}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.episodeTitle, globalTheme.playerText]}>
              {nowPlayingItem.episodeTitle}
            </Text>
          </View>
          {
            playbackState !== PVTrackPlayer.STATE_BUFFERING &&
            <TouchableOpacity onPress={togglePlay}>
              <Icon
                color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
                name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause' : 'play'}
                size={30}
                style={styles.button} />
            </TouchableOpacity>
          }
          {
            playbackState === PVTrackPlayer.STATE_BUFFERING &&
              <ActivityIndicator
                color={globalTheme.activityIndicator.color}
                size='large'
                style={styles.button} />
          }
        </View>
      </TouchableWithoutFeedback>
    )
  }

}

const styles = StyleSheet.create({
  button: {
    height: 60,
    lineHeight: 60,
    paddingLeft: 3,
    textAlign: 'center',
    width: 52
  },
  episodeTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: 24,
    marginBottom: 6
  },
  image: {
    height: 60,
    width: 60
  },
  player: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 62
  },
  podcastTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: 27,
    marginTop: 3
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 2
  }
})
