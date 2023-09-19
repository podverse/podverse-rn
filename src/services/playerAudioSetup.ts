import { getGlobal } from 'reactn'
import { Platform } from 'react-native'
import TrackPlayer, {
  // AndroidAudioContentType,
  AppKilledPlaybackBehavior,
  Capability,
  IOSCategoryMode,
  RepeatMode,
  UpdateOptions
} from 'react-native-track-player'
import { PVAudioPlayer } from './playerAudio'

const setupPlayer = async (options: Parameters<typeof TrackPlayer.setupPlayer>[0]) => {
  const setup = async () => {
    try {
      await TrackPlayer.setupPlayer(options)
    } catch (error) {
      return (error as Error & { code?: string }).code
    }
  }
  while ((await setup()) === 'android_cannot_setup_player_in_background') {
    // A timeout will mostly only execute when the app is in the foreground,
    // and even if we were in the background still, it will reject the promise
    // and we'll try again:
    await new Promise<void>((resolve) => setTimeout(resolve, 1))
  }
}

export const PlayerAudioSetupService = async () => {
  await setupPlayer({
    waitForBuffer: true,
    maxCacheSize: 1000000, // 1 GB from KB, this affects Android only I think.
    iosCategoryMode: IOSCategoryMode.SpokenAudio,
    autoHandleInterruptions: Platform.OS === 'android'
    // androidAudioContentType: AndroidAudioContentType.Speech
  })

  audioUpdateTrackPlayerCapabilities()
  PVAudioPlayer.setRepeatMode(RepeatMode.Off)
}

export const audioUpdateTrackPlayerCapabilities = () => {
  const { jumpBackwardsTime, jumpForwardsTime } = getGlobal()

  const RNTPOptions: UpdateOptions = {
    capabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious
    ],
    compactCapabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo
    ],
    notificationCapabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo
    ],
    backwardJumpInterval: parseInt(jumpBackwardsTime, 10),
    forwardJumpInterval: parseInt(jumpForwardsTime, 10),
    progressUpdateEventInterval: 1,
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
    }
  }

  // HACK: android < 13 doesnt show forward/backward buttons in adnroid auto?
  // proposed solution is to resolve buttons all through custom actions
  if (Platform.OS === 'android') {
    if (Platform.Version > 32) {
      RNTPOptions.customActions = {
        customActionsList: ['customSkipPrev', 'customSkipNext'],
        customSkipPrev: require('../resources/assets/icons/skip-prev.png'),
        customSkipNext: require('../resources/assets/icons/skip-next.png')
      }
    } else {
      RNTPOptions.customActions = {
        customActionsList: ['customSkipPrev', 'customSkipNext', 'customJumpBackward', 'customJumpForward'],
        customSkipPrev: require('../resources/assets/icons/skip-prev.png'),
        customSkipNext: require('../resources/assets/icons/skip-next.png'),
        customJumpForward: require('../resources/assets/icons/forward-30.png'),
        customJumpBackward: require('../resources/assets/icons/replay-10.png')
      }
    }
  }
  PVAudioPlayer.updateOptions(RNTPOptions)
}
