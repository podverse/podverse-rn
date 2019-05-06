import { PVTrackPlayer } from './player'

module.exports = async () => {

  PVTrackPlayer.addEventListener('remote-play', () => PVTrackPlayer.play())

  PVTrackPlayer.addEventListener('remote-pause', () => PVTrackPlayer.pause())

  PVTrackPlayer.addEventListener('remote-stop', () => PVTrackPlayer.destroy())

  PVTrackPlayer.addEventListener('playback-track-changed', () => console.log('playback track changed'))

  PVTrackPlayer.addEventListener('playback-state', () => console.log('playback state'))

}
