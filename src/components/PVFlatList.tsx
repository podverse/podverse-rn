import React from 'react'
import { TextInput } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { core } from '../styles'
import { ActivityIndicator, Text, View } from './'

type Props = {
  data?: any
  endOfResultsReached?: boolean
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
  const { data, endOfResultsReached, filterInputText, handleFilterInputChangeText,
    handleGetItemLayout, initialScrollIndex, isLoadingMore, ItemSeparatorComponent, onEndReached,
    onEndReachedThreshold = 0.8, renderItem } = props


  return (
    <View style={styles.view}>
      <FlatList
        data={data}
        getItemLayout={handleGetItemLayout}
        initialScrollIndex={initialScrollIndex}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        renderItem={function (x) {
          const isLastMsgCell = x.item.id === PV.FlatList.endOfResultsKey || x.item.id === PV.FlatList.isLoadingMoreKey
          if (x.item.id === PV.FlatList.filterInputKey) {
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
          } else if (isLastMsgCell) {
            if (endOfResultsReached && x.item.id === PV.FlatList.endOfResultsKey) {
              return <Text style={[styles.lastCell, globalTheme.text]}>End of results</Text>
            } else if (isLoadingMore && x.item.id === PV.FlatList.isLoadingMoreKey) {
              return <ActivityIndicator styles={styles.lastCell} />
            }
          } else {
            return renderItem(x)
          }
        }}
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
