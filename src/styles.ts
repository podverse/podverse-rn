import { Platform, StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.grayDarkest,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayDarker,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonDelete: {
    backgroundColor: PV.Colors.grayDarkest,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonDisabled: {
    backgroundColor: PV.Colors.grayDarkest
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
    backgroundColor: PV.Colors.grayDarker
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayDark
  },
  actionSheetHeaderText: {
    color: PV.Colors.grayLighter
  },
  actionSheetView: {
    backgroundColor: PV.Colors.grayDarker
  },
  activityIndicator: {
    color: PV.Colors.grayLighter
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
    color: PV.Colors.gray
  },
  buttonSuccessText: {
    color: PV.Colors.white
  },
  buttonWarningText: {
    color: PV.Colors.white
  },
  buttonPrimaryWrapper: {
    backgroundColor: PV.Colors.grayDarker
  },
  buttonDisabledWrapper: {
    backgroundColor: PV.Colors.grayLighter
  },
  buttonSuccessWrapper: {
    backgroundColor: PV.Colors.greenDarker
  },
  buttonWarningWrapper: {
    backgroundColor: PV.Colors.redDarker
  },
  divider: {
    backgroundColor: PV.Colors.grayDark
  },
  flatList: {
    backgroundColor: PV.Colors.ink
  },
  inputContainerText: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
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
    backgroundColor: PV.Colors.grayDarkest
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
    backgroundColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.ink,
    borderColor: PV.Colors.grayDarker,
    borderTopColor: PV.Colors.grayDarker, // override native styles
    borderBottomColor: PV.Colors.grayDarker // override native style
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
    backgroundColor: PV.Colors.black
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
  divider: {
    backgroundColor: PV.Colors.grayLight
  },
  flatList: {
    backgroundColor: PV.Colors.white
  },
  inputContainerText: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
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
    backgroundColor: PV.Colors.grayLightest
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
    backgroundColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter,
    borderTopColor: PV.Colors.grayLighter, // override native styles
    borderBottomColor: PV.Colors.grayLighter // override native style
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
    height: 64,
    lineHeight: 64,
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
    justifyContent: 'center',
    minHeight: 56
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
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    minHeight: PV.FlatList.searchBar.height,
    justifyContent: 'center',
    marginBottom: 8
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  searchBar: {
    borderBottomWidth: 1,
    borderWidth: 1
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
    minWidth: 51,
    textAlign: 'center'
  },
  selectorWrapperRight: {
    alignItems: 'center',
    flexBasis: 'auto',
    justifyContent: 'flex-start',
    marginHorizontal: 12
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  textInputLabel: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 4
  },
  textInputSubTitle: {
    fontSize: PV.Fonts.sizes.md,
    marginVertical: 8
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const hidePickerIconOnAndroidSectionSelector = (isDarkMode: boolean) => {
  return {
    // inputAndroidContainer: {
    //   backgroundColor: isDarkMode ? PV.Colors.grayDarker : PV.Colors.grayLighter
    // }
  }
}

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
    fontSize: PV.Fonts.sizes.lg,
    height: Platform.OS === 'android' ? PV.Navigation.header.height.android - 4 : PV.Navigation.header.height.ios - 4,
    lineHeight:
      Platform.OS === 'android' ? PV.Navigation.header.height.android - 10 : PV.Navigation.header.height.ios - 4,
    marginLeft: 16,
    marginRight: 16
  },
  buttonWrapper: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  headerHeight: {
    paddingTop: Platform.select({
      android: PV.Navigation.header.height.android,
      ios: PV.Navigation.header.height.ios
    })
  }
})

export const playerStyles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    width: 60
  },
  iconDisabled: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  iconLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 80
  }
})

export const sliderStyles = StyleSheet.create({
  clipEndTimeFlag: {
    height: 36,
    left: 0,
    position: 'absolute',
    top: 2,
    width: 2
  },
  clipStartTimeFlag: {
    height: 36,
    left: 0,
    position: 'absolute',
    top: 2,
    width: 2
  },
  thumbStyle: {
    borderRadius: 0,
    height: 24,
    width: 7
  },
  time: {
    fontSize: PV.Fonts.sizes.xs,
    marginHorizontal: 12
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  wrapper: {
    minHeight: 56,
    marginBottom: 8,
    position: 'relative'
  }
})

export const table = StyleSheet.create({
  cellText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    paddingLeft: 8
  },
  cellWrapper: {
    alignItems: 'center',
    minHeight: PV.Table.cells.standard.height
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
