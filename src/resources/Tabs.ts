import { translate } from '../lib/i18n'

export const Tabs = {
  Podcasts: {
    title: translate('Podcasts'),
    icon: require('./images/tab-icons/tab-podcasts.png'),
    index: 0
  },
  Episodes: {
    title: translate('Episodes'),
    icon: require('./images/tab-icons/tab-episodes.png'),
    index: 1
  },
  Clips: {
    title: translate('Clips'),
    icon: require('./images/tab-icons/tab-clips.png'),
    index: 2
  },
  More: {
    title: translate('More'),
    icon: require('./images/tab-icons/tab-more.png'),
    index: 3
  },
  MyLibrary: {
    title: translate('My Library'),
    icon: require('./images/tab-icons/tab-queue.png'),
    index: 4
  },
  styles: {
    height: 48
  }
}
