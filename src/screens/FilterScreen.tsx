import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { FlatList, Icon, NavHeaderButtonText, Text, View } from '../components'
import { generateSections } from '../lib/filters'
import { translate } from '../lib/i18n'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { getDefaultCategory } from '../services/category'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

type State = {
  flatCategoryItems?: any[]
  sections?: any
  selectedCategoryItemKey?: string
  selectedCategorySubItemKey?: string
  selectedFilterItemKey?: string
  selectedFromItemKey?: string
  selectedSortItemKey?: string
  screenName: string
}

const testIDPrefix = 'filter_screen'

export class FilterScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const flatCategoryItems = this.props.navigation.getParam('flatCategoryItems') || []

    this.state = {
      flatCategoryItems,
      screenName: '',
      sections: [],
      selectedCategoryItemKey: '',
      selectedCategorySubItemKey: '',
      selectedFilterItemKey: '',
      selectedFromItemKey: '',
      selectedSortItemKey: ''
    }
  }

  static navigationOptions = ({ navigation }) => {
    const filterScreenTitle = navigation.getParam('filterScreenTitle')

    return {
      title: filterScreenTitle || '',
      headerLeft: () => null,
      headerRight: () => (
        <NavHeaderButtonText
          accessibilityHint={translate('ARIA HINT - dismiss this screen')}
          accessibilityLabel={translate('Done')}
          handlePress={navigation.dismiss}
          testID={testIDPrefix}
          text={translate('Done')} />
      )
    }
  }

  componentDidMount() {
    trackPageView('/filter', 'Filter Screen')
    const { navigation } = this.props
    const { flatCategoryItems } = this.state
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')
    const screenName = navigation.getParam('screenName')
    const selectedCategoryItemKey = navigation.getParam('selectedCategoryItemKey')
    const selectedCategorySubItemKey = navigation.getParam('selectedCategorySubItemKey')
    const selectedFilterItemKey = navigation.getParam('selectedFilterItemKey')
    const selectedFromItemKey = navigation.getParam('selectedFromItemKey')
    const selectedSortItemKey = navigation.getParam('selectedSortItemKey')

    const { newSelectedSortItemKey, sections } = generateSections({
      addByRSSPodcastFeedUrl,
      flatCategoryItems,
      screenName,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedFromItemKey,
      selectedSortItemKey
    })

    this.setState({
      screenName,
      sections,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedFromItemKey,
      selectedSortItemKey: newSelectedSortItemKey
    })
  }

  getNewLocalState = async (section: any, item: any) => {
    const {
      flatCategoryItems,
      screenName,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedFromItemKey,
      selectedSortItemKey
    } = this.state
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')
    const options = { addByRSSPodcastFeedUrl, flatCategoryItems, screenName } as any

    if (section.value === PV.Filters._sectionFromKey) {
      options.selectedFromItemKey = item.value
      options.selectedFilterItemKey = selectedFilterItemKey
      options.selectedSortItemKey = selectedSortItemKey
    } else if (section.value === PV.Filters._sectionFilterKey) {
      options.selectedFilterItemKey = item.value
      options.selectedSortItemKey = selectedSortItemKey
      if (item.value === PV.Filters._categoryKey) {
        const defaultCategory = await getDefaultCategory()
        options.selectedCategoryItemKey = defaultCategory?.id
      }
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.parentId) {
        options.selectedCategorySubItemKey = item.value || item.id
        options.selectedCategoryItemKey = item.parentId
      } else {
        options.selectedCategoryItemKey = item?.value || item?.id
      }
      options.selectedFilterItemKey = selectedFilterItemKey
      options.selectedSortItemKey = selectedSortItemKey
    } else if (section.value === PV.Filters._sectionSortKey) {
      options.selectedSortItemKey = item?.value
      options.selectedFilterItemKey = selectedFilterItemKey
      options.selectedCategoryItemKey = selectedCategoryItemKey
      options.selectedCategorySubItemKey = selectedCategorySubItemKey
      options.selectedFromItemKey = selectedFromItemKey
    }

    const {
      newSelectedCategoryItemKey,
      newSelectedCategorySubItemKey,
      newSelectedFilterItemKey,
      newSelectedFromItemKey,
      newSelectedSortItemKey,
      sections
    } = generateSections(options)

    return {
      selectedCategoryItemKey: newSelectedCategoryItemKey,
      selectedCategorySubItemKey: newSelectedCategorySubItemKey,
      selectedFilterItemKey: newSelectedFilterItemKey,
      selectedFromItemKey: newSelectedFromItemKey,
      selectedSortItemKey: newSelectedSortItemKey,
      sections
    }
  }

  getSelectHandler = async (section: any, item: any) => {
    const { navigation } = this.props
    let handleSelect: any
    let categoryValueOverride = ''
    if (section.value === PV.Filters._sectionFromKey) {
      handleSelect = navigation.getParam('handleSelectFromItem')
    } else if (section.value === PV.Filters._sectionFilterKey) {
      if (item.value === PV.Filters._categoryKey) {
        handleSelect = navigation.getParam('handleSelectCategoryItem')
        const defaultCategory = await getDefaultCategory()
        categoryValueOverride = defaultCategory.id
      } else {
        handleSelect = navigation.getParam('handleSelectFilterItem')
      }
    } else if (section.value === PV.Filters._sectionCategoryKey) {
      if (item.value && !item.parentId) {
        handleSelect = navigation.getParam('handleSelectCategoryItem')
      } else {
        handleSelect = navigation.getParam('handleSelectCategorySubItem')
      }
    } else if (section.value === PV.Filters._sectionSortKey) {
      handleSelect = navigation.getParam('handleSelectSortItem')
    }
    return { categoryValueOverride, handleSelect }
  }

  renderItem = ({ item, section }) => {
    const {
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedFromItemKey,
      selectedSortItemKey
    } = this.state

    const value = item?.value || item?.id

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
        if (item?.parentId && item?.id === selectedCategorySubItemKey) {
          isActive = true
        }
      } else if (item.value && item.value === selectedCategoryItemKey) {
        isActive = true
      }
    } else {
      isActive = [selectedFilterItemKey, selectedFromItemKey, selectedSortItemKey].includes(value)
    }

    const isSubCategory = item.parentId
    const itemTextStyle = isSubCategory ? [styles.itemSubText] : [styles.itemText]

    const accessibilityHint = `${isActive ? translate('ARIA HINT - Currently selected filter') : ''}`

    return (
      <TouchableWithoutFeedback
        accessibilityHint={accessibilityHint}
        accessibilityLabel={item.labelShort || item.label || item.title}
        importantForAccessibility='yes'
        onPress={async () => {
          const { categoryValueOverride, handleSelect } = await this.getSelectHandler(section, item)
          const newState = (await this.getNewLocalState(section, item)) as any

          this.setState(newState, () => {
            handleSelect(categoryValueOverride || value)
          })
        }}
        testID={`${testIDPrefix}_${value}`.prependTestId()}>
        <View style={styles.itemWrapper}>
          <Text
            importantForAccessibility='no-hide-descendants'
            style={[itemTextStyle, isActive ? { fontWeight: PV.Fonts.weights.extraBold, color: PV.Colors.white } : {}]}>
            {item.labelShort || item.label || item.title}
          </Text>
          {isActive && (
            <Icon
              name='check'
              size={24}
              style={styles.itemIcon}
              testID={`${testIDPrefix}_${value}_check`}/>
          )}
        </View>
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const { sections } = this.state

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <FlatList
          disableLeftSwipe
          disableNoResultsMessage
          keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.value || item?.id)}
          renderSectionHeader={({ section }) => (
              <View style={styles.sectionItemWrapper}>
                <Text
                  accessible
                  accessibilityHint={section.accessibilityHint}
                  accessibilityLabel={section.title}
                  accessibilityRole={section.accessibilityRole}
                  style={styles.sectionItemText}>{section.title}</Text>
              </View>
            )}
          renderItem={this.renderItem}
          sections={sections}
          testID={testIDPrefix}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  hideItem: {
    height: 0
  },
  itemIcon: {
    marginTop: 4,
    marginRight: 36,
    color: PV.Colors.brandBlueLight
  },
  itemSubText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.thin,
    paddingLeft: 64,
    paddingRight: 36,
    color: PV.Colors.grayLighter
  },
  itemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.thin,
    paddingHorizontal: 36,
    color: PV.Colors.grayLighter
  },
  itemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
