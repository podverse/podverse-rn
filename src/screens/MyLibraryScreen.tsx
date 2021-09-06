import { SectionList, View as RNView } from 'react-native'
import { Badge } from 'react-native-elements'
import React from 'reactn'
import { Divider, TableCell, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core, table } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  options: any[]
}

const testIDPrefix = 'my_library_screen'

export class MyLibraryScreen extends React.Component<Props, State> {

  state = {
    options: []
  }

  static navigationOptions = () => ({
      title: translate('My Library')
    })

  componentDidMount() {
    trackPageView('/myLibrary', 'My Library Screen')
  }

  _myLibraryOptions = (isLoggedIn: boolean) => {
    const loggedInFeatures = [_myClipsKey, _myProfileKey, _playlistsKey, _profilesKey]

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
    } else if (item.key === _myProfileKey) {
      const user = this.global.session.userInfo
      params = {
        user,
        navigationTitle: translate('My Profile'),
        isMyProfile: true
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
      <View
        style={core.backgroundView}
        testID={`${testIDPrefix}_view`}>
        <SectionList
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => {
            const accessibilityLabel = item.key === _downloadsKey && downloadsActiveCount > 0
              ? `${item.title} - ${downloadsActiveCount} ${downloadsActiveCount === 1
                ? translate('Download in progress')
                : translate('Downloads in progress')
              }`
              : item.key === _downloadsKey
                ? `${item.title} - ${translate('No downloads in progress')}`
                : item.title

            return (
              <TableCell
                accessibilityLabel={accessibilityLabel}
                testIDPrefix={`${testIDPrefix}_${item.key}`}
                testIDSuffix='' 
                onPress={() => this._onPress(item)}>
                {item.key === _downloadsKey ? (
                  <RNView style={core.row}>
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.md}
                      style={table.cellText}>
                      {item.title}
                    </Text>
                    {item.key === _downloadsKey && downloadsActiveCount > 0 &&
                      fontScaleMode !== PV.Fonts.fontScale.larger &&
                      fontScaleMode !== PV.Fonts.fontScale.largest && (
                        <Badge
                          badgeStyle={{ width:25, height:25, backgroundColor: PV.Colors.redLighter, borderRadius:12.5 }}
                          containerStyle={{
                            position: 'absolute',
                            right: -32,
                            top: 0
                          }}
                          status='error'
                          textStyle={{fontSize:PV.Fonts.largeSizes.xxl, fontWeight:PV.Fonts.weights.bold}}
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
              </TableCell>
            )
          }}
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
const _myProfileKey = 'MyProfile'
const _playlistsKey = 'Playlists'
const _profilesKey = 'Profiles'

const allMyLibraryFeatures = [
  {
    title: translate('Downloads'),
    key: _downloadsKey,
    routeName: PV.RouteNames.DownloadsScreen
  },
  {
    title: translate('Queue'),
    key: _queueKey,
    routeName: PV.RouteNames.QueueScreen
  },
  {
    title: translate('History'),
    key: _historyKey,
    routeName: PV.RouteNames.HistoryScreen
  },
  {
    title: translate('My Clips'),
    routeName: PV.RouteNames.MyProfileScreen,
    key: _myClipsKey
  },
  {
    title: translate('My Profile'),
    routeName: PV.RouteNames.MyProfileScreen,
    key: _myProfileKey
  },
  {
    title: translate('Playlists'),
    key: _playlistsKey,
    routeName: PV.RouteNames.PlaylistsScreen
  },
  {
    title: translate('Profiles'),
    key: _profilesKey,
    routeName: PV.RouteNames.ProfilesScreen
  }
]
