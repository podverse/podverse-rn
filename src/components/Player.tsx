import { Image, StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React from 'reactn'
import { PV } from '../resources'
import { core, darkTheme, iconStyles } from '../styles'

export class Player extends React.PureComponent {
  render () {
    const { globalTheme, player } = this.global
    const { isPlaying, nowPlayingItem } = player
    const isDarkMode = globalTheme === darkTheme

    return (
      <View style={[styles.player, globalTheme.player]}>
        <Image source={PV.Images.MORE} resizeMode='contain' />
        <View style={core.row}>
          <Text style={[styles.podcastTitle, globalTheme.playerText]}>{nowPlayingItem.podcastTitle}</Text>
          <Text style={[styles.episodeTitle, globalTheme.playerText]}>{nowPlayingItem.episodeTitle}</Text>
        </View>
        <Icon
          color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
          name={isPlaying ? 'pause' : 'play'}
          onPress={() => console.log('play / pause')}
          size={32}
          style={styles.button} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 8
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.lg
  },
  player: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 50,
    width: '100%'
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg
  }
})
