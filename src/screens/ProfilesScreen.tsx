import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, ProfileTableCell, SwipeRowBack, View } from '../components'
import { PV } from '../resources'
import { getPublicUsersByQuery } from '../services/user'
import { toggleSubscribeToUser } from '../state/actions/users'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
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
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryPage: 1
    }
  }

  async componentDidMount() {
    const newState = await this._queryData(1)
    this.setState(newState)
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
        key={item.id}
        name={item.name}
        onPress={() => this.props.navigation.navigate(
          PV.RouteNames.ProfileScreen, { user: item }
        )} />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => <SwipeRowBack onPress={() => this._handleHiddenItemPress(item.id, rowMap)} />

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    rowMap[selectedId].closeRow()
    const { flatListData } = this.state
    await toggleSubscribeToUser(selectedId)
    const newFlatListData = flatListData.filter((x) => x.id !== selectedId)
    this.setState({ flatListData: newFlatListData })
  }

  render() {
    const { flatListData, isLoading, isLoadingMore } = this.state

    return (
      <View style={styles.view}>
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && flatListData && flatListData.length > 0 &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={false}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderProfileItem} />
        }
      </View>
    )
  }

  _queryData = async (page: number = 1) => {
    const { flatListData } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      queryPage: 1
    } as State

    const subscribedUserIds = this.global.session.userInfo.subscribedUserIds

    const results = await getPublicUsersByQuery({
      page: 1,
      ...(subscribedUserIds.length > 0 ? { userIds: subscribedUserIds } : {})
    })

    newState.flatListData = [...flatListData, ...results[0]]
    newState.endOfResultsReached = newState.flatListData.length >= results[1]

    return newState
  }
}

const styles = {
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
}
