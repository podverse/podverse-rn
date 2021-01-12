import { StyleSheet, View as RNView } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import React from 'reactn'
import { FlatList, Icon, NavDismissIcon, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

type State = {
  categoryItems?: any
  sections?: any
  selectedCategoryItemKey?: string
  selectedCategorySubItemKey?: string
  selectedFilterItemKey?: string
  selectedSortItemKey?: string
}

const testIDPrefix = 'filter_screen'

const sectionsWithCategory = (filterItems: any, categoryItems: any, sortItems: any) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Category'), data: categoryItems, value: PV.Filters._sectionCategoryKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

const sectionsWithoutCategory = (filterItems: any, sortItems: any) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

export class FilterScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: null
    }
  }

  constructor(props: Props) {
    super(props)

    const { navigation } = props
    const selectedCategoryItemKey = navigation.getParam('selectedCategoryItemKey')
    const selectedCategorySubItemKey = navigation.getParam('selectedCategorySubItemKey')
    const selectedFilterItemKey = navigation.getParam('selectedFilterItemKey')
    const selectedSortItemKey = navigation.getParam('selectedSortItemKey')
    const filterItems = navigation.getParam('filterItems') || []
    const categoryItems = navigation.getParam('categoryItems') || []
    const sortItems = navigation.getParam('sortItems') || []

    const flatCategoryItems = []
    for (const categoryItem of categoryItems) {
      flatCategoryItems.push(categoryItem)
      const subCategoryItems = categoryItem.categories
      for (const subCategoryItem of subCategoryItems) {
        subCategoryItem.parentId = categoryItem.id
        flatCategoryItems.push(subCategoryItem)
      }
    }

    const sections =
      selectedFilterItemKey.value === PV.Filters._categoryKey
        ? sectionsWithCategory(filterItems, flatCategoryItems, sortItems)
        : sectionsWithoutCategory(filterItems, sortItems)

    this.state = {
      categoryItems: flatCategoryItems,
      sections,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey
    }
  }

  async componentDidMount() {
    trackPageView('/filter', 'Filter Screen')
  }

  handleStateUpdate = (section: any, item: any) => {
    const { navigation } = this.props
    const { categoryItems } = this.state
    const value = item.value || item.id
    const filterItems = navigation.getParam('filterItems') || []
    const sortItems = navigation.getParam('sortItems') || []

    if (section.value === PV.Filters._sectionFilterKey) {
      const sections =
        item.value === PV.Filters._categoryKey
          ? sectionsWithCategory(filterItems, categoryItems, sortItems)
          : sectionsWithoutCategory(filterItems, sortItems)
      if (value === PV.Filters._categoryKey) {
        this.setState({
          sections,
          selectedCategoryItemKey: categoryItems[0].value,
          selectedCategorySubItemKey: '',
          selectedFilterItemKey: value
        })
      } else {
        this.setState({
          sections,
          selectedCategoryItemKey: '',
          selectedCategorySubItemKey: '',
          selectedFilterItemKey: value
        })
      }
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.parentId) {
        this.setState({
          selectedCategorySubItemKey: value
        })
      } else {
        this.setState({
          selectedCategoryItemKey: value,
          selectedCategorySubItemKey: ''
        })
      }
    } else if (section.value === PV.Filters._sectionSortKey) {
      this.setState({
        selectedSortItemKey: value
      })
    }
  }

  getSelectHandler = (section: any, item: any) => {
    const { navigation } = this.props
    let handleSelect: any
    if (section.value === PV.Filters._sectionFilterKey) {
      handleSelect = navigation.getParam('handleSelectFilterItem')
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.value && !item.parentId) {
        handleSelect = navigation.getParam('handleSelectCategoryItem')
      } else {
        handleSelect = navigation.getParam('handleSelectCategorySubItem')
      }
    } else if (section.value === PV.Filters._sectionSortKey) {
      handleSelect = navigation.getParam('handleSelectSortItem')
    }
    return handleSelect
  }

  renderItem = ({ item, section }) => {
    const {
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey
    } = this.state

    const value = item.value || item.id

    /* Do not render category cells unless the category filter is active. */
    if (
      section.value === PV.Filters._sectionCategoryKey &&
      selectedFilterItemKey === PV.Filters._categoryKey &&
      selectedCategoryItemKey &&
      item.parentId &&
      selectedCategoryItemKey !== item.parentId
    ) {
      return <RNView />
    }

    let isActive = false
    if (section.value === PV.Filters._sectionCategoryKey) {
      if (selectedCategorySubItemKey) {
        if (item.parentId && item.id === selectedCategorySubItemKey) {
          isActive = true
        }
      } else if (item.value && item.value === selectedCategoryItemKey) {
        isActive = true
      }
    } else {
      isActive = [selectedFilterItemKey, selectedSortItemKey].includes(value)
    }

    const isSubCategory = item.parentId
    const itemTextStyle = isSubCategory ? [styles.itemSubText] : [styles.itemText]

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          const selectHandler = this.getSelectHandler(section, item)
          const stateKey = this.handleStateUpdate(section, item) as any
          this.setState({ [stateKey]: value }, () => {
            selectHandler(value)
          })
        }}>
        <View style={styles.itemWrapper}>
          <Text style={itemTextStyle}>{item.label || item.title}</Text>
          {isActive && <Icon style={styles.itemIcon} name='check' size={24} />}
        </View>
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const { sections } = this.state

    return (
      <FlatList
        disableLeftSwipe={true}
        disableNoResultsMessage={true}
        keyExtractor={(item: any) => item.value || item.id}
        renderSectionHeader={({ section }) => {
          return (
            <View style={styles.sectionItemWrapper}>
              <Text style={styles.sectionItemText}>{section.title}</Text>
            </View>
          )
        }}
        renderItem={this.renderItem}
        sections={sections}
      />
    )
  }
}

const styles = StyleSheet.create({
  hideItem: {
    height: 0
  },
  itemIcon: {
    marginTop: 4
  },
  itemSubText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingLeft: 64,
    paddingRight: 36
  },
  itemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingHorizontal: 36
  },
  itemWrapper: {
    flexDirection: 'row',
    marginBottom: 20
  },
  sectionItemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    paddingHorizontal: 16
  },
  sectionItemWrapper: {
    marginBottom: 20,
    marginTop: 28
  },
  view: {
    backgroundColor: 'blue',
    flex: 1
  }
})
