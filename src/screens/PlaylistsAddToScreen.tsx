import { TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PlaylistTableCell, View } from '../components'
import { PV } from '../resources'
import { addOrRemovePlaylistItem } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  episodeId?: string
  isLoading: boolean
  mediaRefId?: string
}

export class PlaylistsAddToScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: 'Add to Playlist',
    headerLeft: (
      <TouchableOpacity
        onPress={navigation.dismiss}>
        <Icon
          color='#fff'
          iconStyle={styles.closeButton}
          name='angle-down'
          size={32}
          type='font-awesome'
          underlayColor={PV.Colors.brandColor} />
      </TouchableOpacity>
    ),
    headerRight: null
  })

  constructor(props: Props) {
    super(props)
    const { navigation } = props
    this.state = {
      episodeId: navigation.getParam('episodeId'),
      isLoading: true,
      mediaRefId: navigation.getParam('mediaRefId')
    }
  }

  async componentDidMount() {
    await getLoggedInUserPlaylists(this.global)
    this.setState({ isLoading: false })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderPlaylistItem = ({ item }) => {
    const { episodeId, mediaRefId } = this.state

    return (
      <PlaylistTableCell
        key={item.id}
        itemCount={item.itemCount}
        onPress={() => addOrRemovePlaylistItem(item.id, episodeId, mediaRefId, this.global)}
        title={item.title} />
    )
  }

  render() {
    const { isLoading } = this.state
    const { myPlaylists } = this.global.screenPlaylistsAddTo

    return (
      <View style={styles.view}>
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && myPlaylists && myPlaylists.length > 0 &&
            <FlatList
              data={myPlaylists}
              disableLeftSwipe={true}
              extraData={myPlaylists}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderPlaylistItem} />
        }
      </View>
    )
  }
}

const styles = {
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  view: {
    flex: 1
  }
}
