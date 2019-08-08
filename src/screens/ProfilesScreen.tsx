import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, MessageWithAction, ProfileTableCell, SwipeRowBack,
  View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
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
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const nextPage = queryPage + 1
          const newState = await this._queryData(nextPage)
          this.setState(newState)
        })
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderProfileItem = ({ item }) => {
    return (
      <ProfileTableCell
        key={`ProfilesScreen_${item.id}`}
        name={item.name}
        onPress={() => this.props.navigation.navigate(
          PV.RouteNames.ProfileScreen, {
            user: item,
            navigationTitle: 'Profile'
          }
        )} />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack
      isLoading={this.state.isUnsubscribing}
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)} />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const wasAlerted = await alertIfNoNetworkConnection('unsubscribe from this profile')
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
    const { isLoading, isLoadingMore } = this.state
    const { flatListData, flatListDataTotalCount } = this.global.profiles
    const { isLoggedIn } = this.global.session

    return (
      <View style={styles.view}>
        <View style={styles.view}>
          {
            !isLoading && !isLoggedIn &&
              <MessageWithAction
                actionHandler={this._onPressLogin}
                actionText='Login'
                message='Login to view your profiles' />
          }
          {
            isLoading &&
              <ActivityIndicator />
          }
          {
            isLoggedIn && !isLoading && flatListData && flatListData.length > 0 &&
              <FlatList
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableLeftSwipe={false}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                onEndReached={this._onEndReached}
                renderHiddenItem={this._renderHiddenItem}
                renderItem={this._renderProfileItem} />
          }
          {
            isLoggedIn && !isLoading && flatListData && flatListData.length === 0 &&
              <MessageWithAction
                message='You have no subscribed profiles'
                subMessage='Ask a friend to send a link to their profile, then subscribe to it' />
          }
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

    const wasAlerted = await alertIfNoNetworkConnection('load profiles')
    if (wasAlerted) return newState

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
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  view: {
    flex: 1
  }
})
