import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, ProfileTableCell, SwipeRowBack, View } from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { isOdd } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { getAuthUserInfo } from '../state/actions/auth'
import { getPublicUsersByQuery, toggleSubscribeToUser } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isUnsubscribing: boolean
  queryPage: number
  showNoInternetConnectionMessage?: boolean
}

const testIDPrefix = 'profiles_screen'

export class ProfilesScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    this.state = {
      endOfResultsReached: false,
      isLoading: this.global.session.isLoggedIn,
      isLoadingMore: false,
      isUnsubscribing: false,
      queryPage: 1
    }
  }
  
  static navigationOptions = () => ({
      title: translate('Profiles')
    })

  async componentDidMount() {
    const { navigation } = this.props

    if (this.global.session.isLoggedIn) {
      await getAuthUserInfo()
      const newState = await this._queryData(1)
      this.setState(newState)
    }

    const userId = navigation.getParam('navToProfileWithId')

    if (userId) {
      navigation.navigate(PV.RouteNames.ProfileScreen, { userId })
    }

    trackPageView('/profiles', 'Profiles Screen')
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, queryPage = 1 } = this.state
    if (!endOfResultsReached && this.shouldLoad) {
      if (distanceFromEnd > -1) {
        this.shouldLoad = false

        this.setState(
          {
            isLoadingMore: true
          },
          () => {
            (async () => {
              const nextPage = queryPage + 1
              const newState = await this._queryData(nextPage)
              this.setState(newState)
            })()
          }
        )
      }
    }
  }

  _ItemSeparatorComponent = () => <Divider />

  _renderProfileItem = ({ item, index }) => {
    // In order to be subscribed to a profile, that profile must be public,
    // so add isPublic = true so ProfileScreen shows the share icon.
    item.isPublic = true
    return (
      <ProfileTableCell
        hasZebraStripe={isOdd(index)}
        name={item.name}
        onPress={() =>
          this.props.navigation.navigate(PV.RouteNames.ProfileScreen, {
            user: item,
            navigationTitle: translate('Profile')
          })
        }
        testID={`${testIDPrefix}_profile_${index}`}
      />
    )
  }

  _renderHiddenItem = ({ item, index }, rowMap) => (
    <SwipeRowBack
      isLoading={this.state.isUnsubscribing}
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)}
      testID={`${testIDPrefix}_profile_${index}`}
      text={translate('Remove')}
    />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const wasAlerted = await alertIfNoNetworkConnection(translate('unsubscribe from this profile'))
    if (wasAlerted) return

    this.setState({ isUnsubscribing: true }, () => {
      (async () => {
        try {
          await toggleSubscribeToUser(selectedId)
          rowMap[selectedId].closeRow()
          this.setState({ isUnsubscribing: false })
        } catch (error) {
          this.setState({ isUnsubscribing: false })
        }
      })()
    })
  }

  _onPressLogin = () => {
    this.props.navigation.goBack(null)
    this.props.navigation.navigate(PV.RouteNames.AuthScreen)
  }

  render() {
    const { isLoading, isLoadingMore, showNoInternetConnectionMessage } = this.state
    const { offlineModeEnabled } = this.global
    const { flatListData, flatListDataTotalCount } = this.global.profiles

    const showOfflineMessage = offlineModeEnabled

    return (
      <View
        style={styles.view}
        testID={`${testIDPrefix}_view`}>
        <View style={styles.view}>
          {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
          {!isLoading && (
            <FlatList
              data={flatListData}
              dataTotalCount={flatListDataTotalCount}
              disableLeftSwipe={false}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              keyExtractor={(item: any) => item.id}
              noResultsMessage={translate('No profiles found')}
              onEndReached={this._onEndReached}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderProfileItem}
              showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
            />
          )}
        </View>
      </View>
    )
  }

  _queryData = async (page = 1) => {
    const { flatListData } = this.global.profiles
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      this.shouldLoad = true
      return newState
    }

    try {
      const subscribedUserIds = this.global.session.userInfo.subscribedUserIds
      const results = await getPublicUsersByQuery(subscribedUserIds, page)
      newState.endOfResultsReached = flatListData.length >= results[1]
      newState.queryPage = page
      this.shouldLoad = true
      return newState
    } catch (error) {
      this.shouldLoad = true
      return newState
    }
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
