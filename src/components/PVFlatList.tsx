import React from 'react'
import { FlatList, TextInput } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { core } from '../styles'
import { ActivityIndicator, View } from './'

type Props = {
  data?: any
  extraData?: any
  filterInputText?: string
  handleFilterInputChangeText?: any
  handleGetItemLayout?: any
  initialScrollIndex?: number
  isLoadingMore?: boolean
  ItemSeparatorComponent?: any
  onEndReached: any
  onEndReachedThreshold?: number
  renderItem: any
}

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const { data, filterInputText, handleFilterInputChangeText,
    isLoadingMore, ItemSeparatorComponent, onEndReached,
    onEndReachedThreshold = 0.8, renderItem, extraData } = props

  let flatList: FlatList<any> | null
  return (
    <View style={styles.view}>
      <FlatList
        data={data}
        extraData={extraData}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onLayout={() => {
          flatList && flatList.scrollToOffset({ offset: PV.FlatList.filterInput.height, animated: false })
        }}
        ref={(ref) => {
          flatList = ref
        }}
        onEndReachedThreshold={onEndReachedThreshold}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return <ActivityIndicator styles={styles.lastCell} />
          }
          return null
        }}
        ListHeaderComponent={() => {
          return (
            <View style={styles.firstCell}>
              <View style={[core.textInputWrapper, globalTheme.textInputWrapper]}>
                <TextInput
                  onChangeText={handleFilterInputChangeText}
                  style={[core.textInput, globalTheme.textInput]}
                  value={filterInputText} />
              </View>
            </View>
          )
        }}
        renderItem={renderItem}
        style={[globalTheme.flatList]} />
    </View>
  )
}

const styles = {
  firstCell: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    height: PV.FlatList.filterInput.height,
    justifyContent: 'center',
    lineHeight: PV.FlatList.filterInput.height,
    textAlign: 'center'
  },
  lastCell: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    height: PV.FlatList.lastCell.height,
    justifyContent: 'center',
    lineHeight: PV.FlatList.lastCell.height,
    textAlign: 'center'
  },
  view: {
    flex: 1
  }
}
