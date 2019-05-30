import { StyleSheet, Text, TouchableOpacity, Alert } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import { ActivityIndicator, Divider, TextInput, View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { updateLoggedInUser } from '../state/actions/user'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading?: boolean
  name?: string
  selectedIsPublicKey?: string
}

export class EditProfileScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Edit Profile',
      headerRight: (
        <TouchableOpacity
          onPress={navigation.getParam('updateUser')}>
          <Text style={navHeader.buttonText}>Save</Text>
        </TouchableOpacity>
      )
    }
  }

  constructor(props: Props) {
    super(props)
    const user = props.navigation.getParam('user')

    this.state = {
      isLoading: true,
      name: user.name,
      selectedIsPublicKey: user.isPublic
    }
  }

  async componentDidMount() {
    this.props.navigation.setParams({ updateUser: this._updateUser })
    try {
      await getAuthUserInfo()
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })
  }

  _updateUser = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('update your profile')
    if (wasAlerted) return

    this.setState({
      isLoading: true
    }, async () => {
      try {
        const { name, selectedIsPublicKey } = this.state
        const { id } = this.global.session.userInfo
        await updateLoggedInUser({
          id,
          isPublic: selectedIsPublicKey,
          name
        }, this.global)
        this.props.navigation.goBack(null)
      } catch (error) {
        if (error.response) {
          Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, [])
        }
      }
      this.setState({ isLoading: false })
    })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _onChangeIsPublic = (key: string) => {
    this.setState({ selectedIsPublicKey: key })
  }

  _onChangeName = (text: string) => {
    this.setState({ name: text })
  }

  render() {
    const { globalTheme } = this.global
    const { isLoading, name, selectedIsPublicKey } = this.state
    const selectedIsPublicOption = isPublicOptions.find((x) => x.value === selectedIsPublicKey) || selectPlaceholder

    return (
      <View style={styles.view}>
          {
            !isLoading ?
              <View>
                <TextInput
                  autoCapitalize='none'
                  onChangeText={this._onChangeName}
                  placeholder='your name'
                  style={[styles.textInput, globalTheme.textInput]}
                  underlineColorAndroid='transparent'
                  value={name} />
                <RNPickerSelect
                  items={isPublicOptions}
                  onValueChange={this._onChangeIsPublic}
                  placeholder={selectPlaceholder}
                  value={selectedIsPublicKey}>
                  <Text style={[core.selectorText, globalTheme.selectorText]}>
                    {selectedIsPublicOption.label} &#9662;
                  </Text>
                </RNPickerSelect>
              </View> : <ActivityIndicator />
          }

      </View>
    )
  }
}

const selectPlaceholder = {
  label: 'Select...',
  value: null
}

const isPublicOptions = [
  {
    label: 'Public',
    value: true
  },
  {
    label: 'Private',
    value: false
  }
]

const styles = StyleSheet.create({
  textInput: {
    fontSize: PV.Fonts.sizes.xl
  },
  view: {
    flex: 1
  }
})
