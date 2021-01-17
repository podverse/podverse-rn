import { SectionList, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { Badge } from 'react-native-elements'
import React from 'reactn'
import { Divider, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

export class MyLibraryScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('My Library')
    }
  }

  state = {
    options: []
  }

  componentDidMount() {
    trackPageView('/myLibrary', 'My Library Screen')
  }

  _myLibraryOptions = (isLoggedIn: boolean) => {
    const loggedInFeatures = [_myClipsKey, _playlistsKey, _profilesKey]

    return allMyLibraryFeatures.filter((item = { key: '', title: '' }) => {
      if (!isLoggedIn) {
        return !loggedInFeatures.some((screenKey: string) => item.key === screenKey)
      }

      return true
    })
  }

  _onPress = (item: any) => {
    const { navigation } = this.props
    let params = {}

    if (item.key === _myClipsKey) {
      const user = this.global.session.userInfo
      params = {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true,
        initializeClips: true
      }
    }

    navigation.navigate(item.routeName, params)
  }

  render() {
    const { downloadsActive, fontScaleMode, globalTheme, session } = this.global
    const { isLoggedIn = false } = session

    let downloadsActiveCount = 0
    for (const id of Object.keys(downloadsActive)) {
      if (downloadsActive[id]) downloadsActiveCount++
    }
    const featureOptions = this._myLibraryOptions(isLoggedIn)

    return (
      <View style={core.backgroundView} {...testProps('my_library_screen_view')}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback onPress={() => this._onPress(item)} {...testProps(item.testID)}>
              <RNView style={[core.row, table.cellWrapper]}>
                {item.key === _downloadsKey ? (
                  <RNView style={[core.row, { position: 'relative' }, table.cellWrapper]}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={table.cellText}>
                      {translate('Downloads')}
                    </Text>
                    {downloadsActiveCount > 0 &&
                      fontScaleMode !== PV.Fonts.fontScale.larger &&
                      fontScaleMode !== PV.Fonts.fontScale.largest && (
                        <Badge
                          containerStyle={{
                            position: 'absolute',
                            right: -22,
                            top: 19
                          }}
                          status='error'
                          value={downloadsActiveCount}
                        />
                      )}
                  </RNView>
                ) : (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                    {item.title}
                  </Text>
                )}
              </RNView>
            </TouchableWithoutFeedback>
          )}
          sections={[{ title: '', data: featureOptions }]}
        />
      </View>
    )
  }
}

const _downloadsKey = 'Downloads'
const _queueKey = 'Queue'
const _historyKey = 'History'
const _myClipsKey = 'MyClips'
const _playlistsKey = 'Playlists'
const _profilesKey = 'Profiles'

const allMyLibraryFeatures = [
  {
    title: translate('Downloads'),
    key: _downloadsKey,
    routeName: PV.RouteNames.DownloadsScreen,
    testID: 'my_library_screen_downloads_cell'
  },
  {
    title: translate('Queue'),
    key: _queueKey,
    routeName: PV.RouteNames.QueueScreen,
    testID: 'my_library_screen_queue_cell'
  },
  {
    title: translate('History'),
    key: _historyKey,
    routeName: PV.RouteNames.HistoryScreen,
    testID: 'my_library_screen_history_cell'
  },
  {
    title: translate('My Clips'),
    routeName: PV.RouteNames.MyProfileScreen,
    key: _myClipsKey,
    testId: 'my_library_screen_my_clips_cell'
  },
  {
    title: translate('Playlists'),
    key: _playlistsKey,
    routeName: PV.RouteNames.PlaylistsScreen,
    testID: 'my_library_screen_playlists_cell'
  },
  {
    title: translate('Profiles'),
    key: _playlistsKey,
    routeName: PV.RouteNames.ProfilesScreen,
    testID: 'my_library_screen_profiles_cell'
  }
]
