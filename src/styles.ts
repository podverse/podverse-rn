import { Platform, StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.ink,
    borderColor: PV.Colors.grayLighterTransparent
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.grayLighterTransparent
  },
  actionSheetButtonDelete: {
    backgroundColor: PV.Colors.ink,
    borderColor: PV.Colors.grayLighterTransparent
  },
  actionSheetButtonDisabled: {
    backgroundColor: PV.Colors.grayLight
  },
  actionSheetButtonText: {
    color: PV.Colors.white
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.white
  },
  actionSheetButtonTextDelete: {
    color: PV.Colors.redLighter
  },
  actionSheetButtonTextDisabled: {
    color: PV.Colors.grayLightest
  },
  actionSheetButtonTextEdit: {
    color: PV.Colors.yellow
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.velvet
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.blueDarker
  },
  actionSheetHeaderText: {
    color: PV.Colors.grayLighter
  },
  actionSheetView: {
    backgroundColor: PV.Colors.ink
  },
  activityIndicator: {
    color: PV.Colors.brandBlueLight
  },
  activityIndicatorAlternate: {
    color: PV.Colors.grayDarkest
  },
  buttonActive: {
    color: PV.Colors.blueLighter
  },
  buttonError: {
    color: PV.Colors.red
  },
  buttonGroup: {
    backgroundColor: PV.Colors.velvet
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.skyDark
  },
  buttonGroupText: {
    color: PV.Colors.white
  },
  buttonGroupTextSelected: {
    color: PV.Colors.white
  },
  buttonImage: {
    borderColor: PV.Colors.white,
    tintColor: PV.Colors.white
  },
  buttonPrimaryText: {
    color: PV.Colors.white
  },
  buttonDisabledText: {
    color: PV.Colors.white
  },
  buttonSuccessText: {
    color: PV.Colors.white
  },
  buttonWarningText: {
    color: PV.Colors.white
  },
  buttonPrimaryWrapper: {
    backgroundColor: PV.Colors.brandColor
  },
  buttonDisabledWrapper: {
    backgroundColor: PV.Colors.gray
  },
  buttonSuccessWrapper: {
    backgroundColor: PV.Colors.greenDarker
  },
  buttonWarningWrapper: {
    backgroundColor: PV.Colors.redDarker
  },
  buttonTransparentWrapper: {
    backgroundColor: 'transparent'
  },
  divider: {
    backgroundColor: PV.Colors.grayDark + '80'
  },
  dropdownButtonIcon: {
    color: PV.Colors.white
  },
  dropdownButtonText: {
    color: PV.Colors.white
  },
  flatList: {
    backgroundColor: PV.Colors.ink
  },
  headerText: {
    color: PV.Colors.skyLight
  },
  link: {
    color: PV.Colors.blueLighter
  },
  makeClipPlayerControlsWrapper: {
    backgroundColor: PV.Colors.grayDarker
  },
  membershipTextExpired: {
    color: PV.Colors.red
  },
  membershipTextExpiring: {
    color: PV.Colors.yellow
  },
  membershipTextPremium: {
    color: PV.Colors.blue
  },
  modalBackdrop: {
    backgroundColor: '#00000075'
  },
  modalInnerWrapper: {
    backgroundColor: PV.Colors.velvet
  },
  overlayAlertDanger: {
    backgroundColor: PV.Colors.redLighter,
    color: PV.Colors.white
  },
  overlayAlertInfo: {
    backgroundColor: PV.Colors.blueLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertLink: {
    color: PV.Colors.white,
    textDecorationLine: 'underline'
  },
  overlayAlertWarning: {
    backgroundColor: PV.Colors.yellow,
    color: PV.Colors.white
  },
  placeholderText: {
    color: PV.Colors.grayLighter
  },
  player: {
    borderColor: PV.Colors.grayDarker
  },
  playerClipTimeFlag: {
    backgroundColor: PV.Colors.yellow
  },
  playerText: {
    color: PV.Colors.white
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.skyLight,
    color: PV.Colors.white
  },
  tabbar: {
    backgroundColor: PV.Colors.ink,
    borderTopWidth: 1,
    borderTopColor: PV.Colors.grayDarker
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tabbarLabel: {
    color: PV.Colors.white
  },
  tableCellBorder: {
    borderColor: PV.Colors.grayDarker
  },
  tableCellTextPrimary: {
    color: PV.Colors.white
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.ink
  },
  tableSectionHeaderTransparent: {
    backgroundColor: PV.Colors.grayDarkerTransparent
  },
  tableSectionHeaderIcon: {
    color: PV.Colors.white
  },
  tableSectionHeaderText: {
    color: PV.Colors.white
  },
  text: {
    color: PV.Colors.white
  },
  textInput: {
    backgroundColor: 'transparent',
    color: PV.Colors.white
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputEyeBrow: {
    color: PV.Colors.skyLight
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.grayDarker,
    borderTopColor: PV.Colors.grayDarker, // override native styles
    borderBottomColor: PV.Colors.grayDarker, // override native style,
    marginBottom: 24
  },
  textNowPlaying: {
    color: PV.Colors.orange
  },
  textSecondary: {
    color: PV.Colors.grayLightest
  },
  view: {
    backgroundColor: PV.Colors.ink
  },
  viewWithZebraStripe: {
    backgroundColor: PV.Colors.grayDarkestZ
  },
  webViewStaticHTMLHeader: {
    color: PV.Colors.grayLightest
  },
  webViewStaticHTMLLink: {
    color: PV.Colors.blueLighter
  },
  webViewStaticHTMLText: {
    color: PV.Colors.white
  },
  webViewStaticHTMLWrapper: {
    backgroundColor: PV.Colors.ink
  }
})

export const lightTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayLightest,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonDelete: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter,
    color: PV.Colors.redDarker
  },
  actionSheetButtonDisabled: {
    backgroundColor: PV.Colors.white
  },
  actionSheetButtonText: {
    color: PV.Colors.black
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.black
  },
  actionSheetButtonTextDelete: {
    color: PV.Colors.red
  },
  actionSheetButtonTextDisabled: {
    color: PV.Colors.grayDarkest
  },
  actionSheetButtonTextEdit: {
    color: PV.Colors.yellow
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.grayLightest
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayLighter
  },
  actionSheetHeaderText: {
    color: PV.Colors.grayDarker
  },
  activityIndicator: {
    color: PV.Colors.grayDarker
  },
  activityIndicatorAlternate: {
    color: PV.Colors.grayLightest
  },
  buttonActive: {
    color: PV.Colors.blueDarker
  },
  buttonError: {
    color: PV.Colors.red
  },
  buttonGroup: {
    backgroundColor: PV.Colors.grayLightest
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.grayLight
  },
  buttonGroupText: {
    color: PV.Colors.grayDarker
  },
  buttonGroupTextSelected: {
    color: PV.Colors.black
  },
  buttonImage: {
    borderColor: PV.Colors.black,
    tintColor: PV.Colors.black
  },
  buttonPrimaryText: {
    color: PV.Colors.black
  },
  buttonDisabledText: {
    color: PV.Colors.gray
  },
  buttonSuccessText: {
    color: PV.Colors.black
  },
  buttonWarningText: {
    color: PV.Colors.black
  },
  buttonPrimaryWrapper: {
    backgroundColor: PV.Colors.grayLighter
  },
  buttonDisabledWrapper: {
    backgroundColor: PV.Colors.grayDarker
  },
  buttonSuccessWrapper: {
    backgroundColor: PV.Colors.greenLighter
  },
  buttonWarningWrapper: {
    backgroundColor: PV.Colors.redLighter
  },
  buttonTransparentWrapper: {
    backgroundColor: 'transparent'
  },
  divider: {
    backgroundColor: PV.Colors.grayLight
  },
  dropdownButtonIcon: {
    color: PV.Colors.black
  },
  dropdownButtonText: {
    color: PV.Colors.black
  },
  flatList: {
    backgroundColor: PV.Colors.white
  },
  headerText: {
    color: PV.Colors.skyLight
  },
  link: {
    color: PV.Colors.blueDarker
  },
  makeClipPlayerControlsWrapper: {
    backgroundColor: PV.Colors.grayLighter
  },
  membershipTextExpired: {
    color: PV.Colors.red
  },
  membershipTextExpiring: {
    color: PV.Colors.yellow
  },
  membershipTextPremium: {
    color: PV.Colors.blue
  },
  modalBackdrop: {
    backgroundColor: '#00000075'
  },
  modalInnerWrapper: {
    backgroundColor: PV.Colors.velvet
  },
  overlayAlertDanger: {
    backgroundColor: PV.Colors.redLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertInfo: {
    backgroundColor: PV.Colors.blueLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertLink: {
    color: PV.Colors.blueDarker
  },
  overlayAlertWarning: {
    backgroundColor: PV.Colors.yellow,
    color: PV.Colors.grayDarkest
  },
  placeholderText: {
    color: PV.Colors.grayDarker
  },
  player: {
    borderColor: PV.Colors.grayLighter
  },
  playerClipTimeFlag: {
    backgroundColor: PV.Colors.yellow
  },
  playerText: {
    color: PV.Colors.black
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.skyLight,
    color: PV.Colors.black
  },
  tabbar: {
    backgroundColor: PV.Colors.white,
    borderTopWidth: 1,
    borderTopColor: PV.Colors.grayLighter
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tabbarLabel: {
    color: PV.Colors.grayDarker
  },
  tableCellBorder: {
    borderColor: PV.Colors.grayLighter
  },
  tableCellTextPrimary: {
    color: PV.Colors.black
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.grayLighter
  },
  tableSectionHeaderTransparent: {
    backgroundColor: PV.Colors.grayLighterTransparent
  },
  tableSectionHeaderIcon: {
    color: PV.Colors.black
  },
  tableSectionHeaderText: {
    color: PV.Colors.black
  },
  text: {
    color: PV.Colors.black
  },
  textInput: {
    backgroundColor: 'transparent',
    color: PV.Colors.black
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputEyeBrow: {
    color: PV.Colors.skyDark
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.grayLighter,
    borderColor: PV.Colors.grayLighter,
    borderTopColor: PV.Colors.grayLighter, // override native styles
    borderBottomColor: PV.Colors.grayLighter // override native style
  },
  textNowPlaying: {
    color: PV.Colors.orange
  },
  textSecondary: {
    color: PV.Colors.grayDarkest
  },
  view: {
    backgroundColor: PV.Colors.white
  },
  viewWithZebraStripe: {
    backgroundColor: PV.Colors.grayLightestZ
  },
  webViewStaticHTMLHeader: {
    color: PV.Colors.grayDarkest
  },
  webViewStaticHTMLLink: {
    color: PV.Colors.blueDarker
  },
  webViewStaticHTMLText: {
    color: PV.Colors.black
  },
  webViewStaticHTMLWrapper: {
    backgroundColor: PV.Colors.white
  }
})

export const tabbar = StyleSheet.create({
  labelLight: {
    fontSize: PV.Fonts.sizes.tiny,
    textAlign: 'center',
    color: PV.Colors.white
  },
  labelDark: {
    fontSize: PV.Fonts.sizes.tiny,
    textAlign: 'center',
    color: PV.Colors.black
  }
})

export const images = StyleSheet.create({
  medium: {
    height: Platform.OS === 'ios' ? 64 : 74,
    width: Platform.OS === 'ios' ? 64 : 74
  }
})

export const button = StyleSheet.create({
  iconOnlyLarge: {
    flex: 0,
    height: 76,
    lineHeight: 76,
    textAlign: 'center',
    width: 60,
    zIndex: 1000000
  },
  iconOnlyMedium: {
    flex: 0,
    height: images.medium.height,
    lineHeight: images.medium.height,
    textAlign: 'center',
    width: 44,
    zIndex: 1000000
  },
  iconOnlySmall: {
    flex: 0,
    height: 38,
    lineHeight: 38,
    textAlign: 'center',
    width: 56,
    zIndex: 1000000
  },
  iconOnlyAlignToTop: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 5,
    padding: 8,
    zIndex: 1000000
  },
  primaryWrapper: {
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 200
  }
})

export const core = StyleSheet.create({
  activityIndicator: {
    flex: 1
  },
  backgroundView: {
    flex: 1
  },
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 24,
    marginTop: 0,
    minHeight: 56,
  },
  buttonText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  },
  buttonTextLink: {
    fontSize: PV.Fonts.sizes.xl,
    marginVertical: 12,
    paddingVertical: 12,
    textAlign: 'center'
  },
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  headerText: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 16
  },
  itemWrapper: {
    marginBottom: 24
  },
  itemWrapperReducedHeight: {
    marginTop: -4,
    marginBottom: 16
  },
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    minHeight: PV.FlatList.searchBar.height,
    justifyContent: 'center',
    marginBottom: 8
  },
  pickerSelect: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginVertical: 14
  },
  pickerSelectIcon: {
    flex: 0,
    paddingLeft: 4
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  sectionHeaderText: {
    fontSize: PV.Fonts.sizes.xxxl
  },
  selectorIcon: {
    flex: 0,
    paddingLeft: 4,
    paddingRight: 12
  },
  selectorText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  selectorWrapper: {
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    minHeight: 44
  },
  selectorWrapperLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 76,
    textAlign: 'center'
  },
  selectorWrapperRight: {
    alignItems: 'center',
    flexBasis: 'auto',
    justifyContent: 'flex-start',
    marginHorizontal: 12
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xxl,
    justifyContent: 'center',
    minHeight: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  textInputEyeBrow: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 4
  },
  textInputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    marginTop: 0,
    minWidth: 76
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const hidePickerIconOnAndroidTransparent = (isDarkMode: boolean) => {
  return {
    inputAndroidContainer: {
      backgroundColor: isDarkMode ? PV.Colors.black : PV.Colors.red
    }
  }
}

export const navHeader = StyleSheet.create({
  buttonIcon: {
    flex: 0,
    textAlign: 'center',
    width: 28
  },
  buttonText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.xl,
    marginLeft: 16,
    marginRight: 16
  },
  buttonWrapper: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  headerHeight: {
    paddingTop:
      Platform.select({
        android: PV.Navigation.header.height.android,
        ios: PV.Navigation.header.height.ios
      }) || 0
  }
})

export const playerStyles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    width: 60
  },
  playButton: {
    borderRadius: 35,
    height: 70,
    width: 70,
    borderColor: PV.Colors.skyDark,
    backgroundColor: PV.Colors.skyLight + '33',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export const sliderStyles = StyleSheet.create({
  clipBarStyle: {
    height: 32,
    position: 'absolute',
    marginVertical: 4,
    zIndex: -1
  },
  thumbStyle: {
    borderRadius: 6,
    height: 12,
    width: 12
  },
  time: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.skyLight
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  wrapper: {
    minHeight: 50,
    marginHorizontal: PV.Player.sliderStyles.wrapper.marginHorizontal
  }
})

export const table = StyleSheet.create({
  cellText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  cellWrapper: {
    justifyContent: "center",
    minHeight: PV.Table.cells.standard.height,
    paddingLeft: 8
  }
})

export const actionSheetStyles = {
  activityIndicator: {
    flex: 0,
    marginLeft: 12,
    marginRight: -32
  },
  animatedView: {
    marginBottom: 24,
    marginHorizontal: 15
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  button: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    minHeight: 62,
    justifyContent: 'center'
  },
  buttonBottom: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopWidth: 1
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonTop: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  buttonCancel: {
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    minHeight: 62,
    justifyContent: 'center'
  },
  buttonText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  },
  header: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  headerMessage: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 4,
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  }
}

export const iconStyles = {
  dark: {
    color: PV.Colors.white,
    underlayColor: PV.Colors.black
  },
  darkSecondary: {
    color: PV.Colors.grayLightest,
    underlayColor: PV.Colors.black
  },
  darkTertiary: {
    color: PV.Colors.gray,
    underlayColor: PV.Colors.gray
  },
  darkRed: {
    color: PV.Colors.redDarker,
    underlayColor: PV.Colors.black
  },
  light: {
    color: PV.Colors.grayDarkest,
    underlayColor: PV.Colors.white
  },
  lightSecondary: {
    color: PV.Colors.grayDarker,
    underlayColor: PV.Colors.white
  },
  lightTertiary: {
    color: PV.Colors.gray,
    underlayColor: PV.Colors.gray
  },
  lightRed: {
    color: PV.Colors.redLighter,
    underlayColor: PV.Colors.white
  }
}

export const getMembershipTextStyle = (globalTheme: any, membershipStatus?: string) => {
  switch (membershipStatus) {
    case PV.MembershipStatus.FREE_TRIAL:
      return globalTheme.membershipTextPremium
    case PV.MembershipStatus.FREE_TRIAL_EXPIRED:
      return globalTheme.membershipTextExpired
    case PV.MembershipStatus.PREMIUM:
      return globalTheme.membershipTextPremium
    case PV.MembershipStatus.PREMIUM_EXPIRED:
      return globalTheme.membershipTextExpired
    case PV.MembershipStatus.PREMIUM_EXPIRING_SOON:
      return globalTheme.membershipTextExpiring
  }
}
