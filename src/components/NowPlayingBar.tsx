import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React from 'reactn'
import { PV } from '../resources'
import { darkTheme, iconStyles } from '../styles'

export class Player extends React.PureComponent {
  render () {
    const { globalTheme, player } = this.global
    const { isLoading, isPlaying, nowPlayingItem } = player
    const isDarkMode = globalTheme === darkTheme

    return (
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
          isLoading &&
            <ActivityIndicator
              color={globalTheme.activityIndicator.color}
              size='large'
              style={styles.button} />
        }
        {
          !isLoading &&
            <Icon
              color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
              name={isPlaying ? 'pause' : 'play'}
              onPress={() => console.log('play / pause')}
              size={30}
              style={styles.button} />
        }
      </View>
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
    height: 60
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
