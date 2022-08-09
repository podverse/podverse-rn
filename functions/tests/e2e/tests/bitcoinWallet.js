/* eslint-disable max-len */
const { getDriver } = require('../driver/driverFactory')
const { confirmAndroidAlert } = require('../driver/helpers/alerts')
const { elementByIdAndClickAndTest, elementByIdClick, elementByIdGetText, elementWaitFor, goBackKey, noTestLabel } = require('../driver/helpers/elements')
const { sendKeysToElementById } = require('../driver/helpers/sendKeys')
const { performScroll, scrollDownKey, scrollUpKey } = require('../driver/helpers/scroll')
const test_bitcoinWallet = async () => {

  console.log('_Bitcoin Wallet_')
  const driver = getDriver()

  const satsTotalTextBefore = await elementByIdGetText('value_tag_setup_screen_balance_text') // should return something like '38595 satoshis'
  console.log(satsTotalTextBefore)
  const satsTotalTextPartsBefore = satsTotalTextBefore.split(' ') // this will return an array of the split string like ['38,595', 'satoshis']
  const satsTotalBefore = satsTotalTextPartsBefore[0].replace(/,/g, '')
  const satsTotalBeforeFinal = parseInt(satsTotalBefore, 10) 
  console.log(satsTotalBeforeFinal)

  //boost
  await elementByIdAndClickAndTest('nav_search_icon', 'search_screen_view')
  await sendKeysToElementById('search_screen_search_bar', 'Joe Rogan', 'Search for Joe Rogan')
  await elementByIdAndClickAndTest('search_screen_podcast_item_0', 'search_screen_action_sheet_goToPodcast_button')
  await elementByIdAndClickAndTest('search_screen_action_sheet_goToPodcast_button', 'podcast_screen_dropdown_button')
  
  await elementByIdAndClickAndTest('podcast_screen_dropdown_button', 'filter_screen_view')
  await elementByIdClick('filter_screen_top-past-week')
  await elementByIdAndClickAndTest('filter_screen_nav_header_button_text', 'podcasts_screen_view')
  await elementByIdClick('podcast_screen_episode_item_0_time_remaining_widget_toggle_play')
  await elementByIdAndClickAndTest('mini_player', 'player_screen_view')
  await elementByIdClick('boost_button')

  await driver.back()

  // then do all your other sats testing steps, including pressing boost, then return to the Wallet screen

  await driver.sleep(10000)
  // do a sleep for 10 seconds to give the Bitcoin lightning network time to process the boost transaction
  await elementByIdAndClickAndTest('tab_more_screen', 'value_tag_setup_screen_view')

  const satsTotalTextAfter = await elementByIdGetText('value_tag_setup_screen_balance_text')
  console.log(satsTotalTextAfter)
  const satsTotalTextPartsAfter = satsTotalTextAfter.split(' ')
  const satsTotalAfter = satsTotalTextPartsAfter[0].replace(/,/g, '')
  const satsTotalAfterFinal = parseInt(satsTotalAfter, 10)
  console.log(satsTotalAfterFinal)
  
  
  if (satsTotalAfter >= satsTotalBefore ) {
      console.log ('Boost Failure')
      throw new Error('Bitcoin Transaction Error. The sats balance has not decreased after sending a boost.')
      
  }

  if (satsTotalAfter < satsTotalBefore ) {
      console.log('Boost Success 🎉')
      
  }

}

module.exports = {
  test_bitcoinWallet
}
