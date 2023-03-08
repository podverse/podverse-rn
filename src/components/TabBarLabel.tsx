import React from 'reactn'
import { Text } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { AppModes } from '../resources/AppMode'
import { tabbar } from '../styles'

type TabKey = 'Podcasts' | 'Episodes' | 'Clips' | 'My Library' | 'More'

type Props = {
  focused?: boolean
  tabKey: TabKey
}

const getTabTitle = (tabKey: TabKey, appMode: AppModes) => {
  let title = ''
  if (tabKey === 'Podcasts') {
    title = translate('Podcasts')
    if (appMode === PV.AppMode.videos) {
      title = translate('Channels')
    }
  } else if (tabKey === 'Episodes') {
    title = translate('Episodes')
    if (appMode === PV.AppMode.videos) {
      title = translate('Videos')
    }
  } else if (tabKey === 'Clips') {
    title = translate('Clips')
  } else if (tabKey === 'My Library') {
    title = translate('My Library')
  } else if (tabKey === 'More') {
    title = translate('More')
  }

  return title
}
export class TabBarLabel extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const { tabKey } = this.props
    const { appMode } = this.global
    const title = getTabTitle(tabKey, appMode)

    return (
      <Text allowFontScaling={false} numberOfLines={1} style={tabbar.labelLight}>
        {title}
      </Text>
    )
  }
}
