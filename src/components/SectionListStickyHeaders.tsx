import React from 'react'
import { SectionList, StyleSheet } from 'react-native'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, Divider, MessageWithAction, View } from './'

type Props = {
  contentOffset?: {
    x: number
    y: number
  }
  disableNoResultsMessage?: boolean
  globalTheme: GlobalTheme
  isLoadingMore?: boolean
  keyExtractor: any
  ListHeaderComponent?: any
  listRef: any
  noResultsMessage?: string
  renderItem: any
  renderSectionHeader?: any
  sections?: any
  showNoInternetConnectionMessage?: boolean
  testID: string
}

type ListFooterComponentProps = {
  globalTheme: GlobalTheme
  isLoadingMore?: boolean
  testID: string
}
class ListFooterComponent extends React.Component<ListFooterComponentProps> {
  render() {
    const { globalTheme, isLoadingMore, testID } = this.props

    if (isLoadingMore) {
      return (
        <View
          accessible={false}
          style={[styles.isLoadingMoreCell, globalTheme.tableCellBorder]}>
          <ActivityIndicator accessible={false} testID={testID} />
        </View>
      )
    }
  
    return <></>
  }
}

export const SectionListStickyHeaders = (props: Props) => {
  const {
    contentOffset,
    disableNoResultsMessage,
    globalTheme,
    isLoadingMore,
    keyExtractor,
    ListHeaderComponent,
    listRef,
    noResultsMessage,
    renderItem,
    renderSectionHeader,
    sections,
    showNoInternetConnectionMessage,
    testID
  } = props

  const shouldShowNoResultsFoundMessage = !disableNoResultsMessage
    && !isLoadingMore && !showNoInternetConnectionMessage

  return (
    <>
      <SectionList
        contentOffset={contentOffset}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => <Divider optional />}
        ListFooterComponent={(
          <ListFooterComponent
            globalTheme={globalTheme}
            isLoadingMore={isLoadingMore}
            testID={testID}
          />
        )}
        ListHeaderComponent={ListHeaderComponent}
        ref={listRef}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        sections={sections}
        stickySectionHeadersEnabled
      />
      {shouldShowNoResultsFoundMessage && (
        <MessageWithAction message={noResultsMessage} testID={testID} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  isLoadingMoreCell: {
    borderTopWidth: 0,
    justifyContent: 'center',
    padding: 24
  }
})
