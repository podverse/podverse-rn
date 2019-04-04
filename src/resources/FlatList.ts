const _endOfResultsKey = 'endOfResults'
const _filterInputKey = 'filterInput'
const _isLoadingMoreKey = 'isLoadingMore'

export const FlatList = {
  endOfResultsKey: _endOfResultsKey as any,
  filterInputKey: _filterInputKey as any,
  isLoadingMoreKey: _isLoadingMoreKey as any,
  endOfListItems: [
    { id: _endOfResultsKey },
    { id: _isLoadingMoreKey }
  ],
  startOfListItems: [
    { id: _filterInputKey }
  ],
  filterInput: {
    height: 60
  },
  lastCell: {
    height: 72
  }
}
