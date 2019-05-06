import { PVTrackPlayer } from './player'

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-track-changed', (x) => console.log('playback track changed'))

  PVTrackPlayer.addEventListener('playback-state', (x) => console.log('playback state'))

  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => console.log('playback queue ended'))

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error'))

  PVTrackPlayer.addEventListener('remote-play', (x) => console.log('remote play'))

  PVTrackPlayer.addEventListener('remote-pause', (x) => console.log('remote pause'))

  PVTrackPlayer.addEventListener('remote-stop', (x) => console.log('remote stop'))

  PVTrackPlayer.addEventListener('remote-next', (x) => console.log('remote next'))

  PVTrackPlayer.addEventListener('remote-previous', (x) => console.log('remote previous'))

  PVTrackPlayer.addEventListener('remote-seek', (x) => console.log('remote seek'))

  PVTrackPlayer.addEventListener('remote-jump-forward', (x) => console.log('remote jump forward'))

  PVTrackPlayer.addEventListener('remote-jump-backward', (x) => console.log('remote jump backward'))

  // PVTrackPlayer.addEventListener('remote-skip', (x) => console.log('remote skip to track in queue'))

  // PVTrackPlayer.addEventListener('remote-duck', (x) => console.log('remote duck'))

}
