import { translate } from '../lib/i18n'
import { RouteNames } from './RouteNames'

const customLaunchScreenOptions = [
  {
    label: translate('Podcasts'),
    value: RouteNames.PodcastsScreen
  },
  {
    label: translate('Episodes'),
    value: RouteNames.EpisodesScreen
  },
  {
    label: translate('Clips'),
    value: RouteNames.ClipsScreen
  }
]

export const CustomLaunchScreen = {
  customLaunchScreenOptions,
  defaultLaunchScreenKey: RouteNames.PodcastsScreen,
  getCustomLaunchScreenOption: (value: string) => {
    return customLaunchScreenOptions.find((x: any) => x.value === value) || customLaunchScreenOptions[0]
  },
  nonDefaultValidScreenKeys: [RouteNames.EpisodesScreen, RouteNames.ClipsScreen],
  validScreenKeys: [RouteNames.PodcastsScreen, RouteNames.EpisodesScreen, RouteNames.ClipsScreen]
}
