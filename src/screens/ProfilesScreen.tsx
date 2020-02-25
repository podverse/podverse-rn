import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  MessageWithAction,
  ProfileTableCell,
  SwipeRowBack,
  View
} from '../components'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { isOdd } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getAuthUserInfo } from '../state/actions/auth'
import {
  getPublicUsersByQuery,
  toggleSubscribeToUser
} from '../state/actions/user'

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

export class ProfilesScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Profiles'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      endOfResultsReached: false,
      isLoading: this.global.session.isLoggedIn,
      isLoadingMore: false,
      isUnsubscribing: false,
      queryPage: 1
    }
  }

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

    gaTrackPageView('/profiles', 'Profiles Screen')
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const nextPage = queryPage + 1
            const newState = await this._queryData(nextPage)
            this.setState(newState)
          }
        )
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

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
            navigationTitle: 'Profile'
          })
        }
      />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack
      isLoading={this.state.isUnsubscribing}
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)}
      text='Remove'
    />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const wasAlerted = await alertIfNoNetworkConnection(
      'unsubscribe from this profile'
    )
    if (wasAlerted) return

    this.setState({ isUnsubscribing: true }, async () => {
      try {
        await toggleSubscribeToUser(selectedId)
        rowMap[selectedId].closeRow()
        this.setState({ isUnsubscribing: true })
      } catch (error) {
        this.setState({ isUnsubscribing: true })
      }
    })
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { isLoading, isLoadingMore, showNoInternetConnectionMessage } = this.state
    const { flatListData, flatListDataTotalCount } = this.global.profiles

    return (
      <View style={styles.view}>
        <View style={styles.view}>
          {isLoading && <ActivityIndicator />}
          {!isLoading && flatListData && flatListData.length > 0 && (
            <FlatList
              data={flatListData}
              dataTotalCount={flatListDataTotalCount}
              disableLeftSwipe={false}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderProfileItem}
              showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            />
          )}
          {!isLoading && flatListData && flatListData.length === 0 && (
            <MessageWithAction message='You have no subscribed profiles' />
          )}
        </View>
      </View>
    )
  }

  _queryData = async (page: number = 1) => {
    const { flatListData } = this.global.profiles
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()
    newState.showNoInternetConnectionMessage = !hasInternetConnection

    try {
      const subscribedUserIds = this.global.session.userInfo.subscribedUserIds
      const results = await getPublicUsersByQuery(subscribedUserIds, page)
      newState.endOfResultsReached = flatListData.length >= results[1]
      newState.queryPage = page
      return newState
    } catch (error) {
      return newState
    }
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
