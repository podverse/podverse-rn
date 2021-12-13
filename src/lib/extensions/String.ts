// tslint:disable:no-string-literal
import linkifyHtml from 'linkifyjs/html'
import Config from 'react-native-config'

declare global {
    // eslint-disable-next-line id-blacklist
    interface String {
    sanitize(nsfw : boolean) : string
    prependTestId() : string
    linkifyHtml() : string
  }
}

String.prototype.linkifyHtml = function() {
  return this ? linkifyHtml(this.toString()) : ''
}

const badWordsRegexObj = require('badwords-list').object
delete badWordsRegexObj.God
badWordsRegexObj.dicks = 1
const badWordsRegexString = `\\b(${Object.keys(badWordsRegexObj).join('|')})\\b`
const badWordsRegex = new RegExp(badWordsRegexString, 'gi')

String.prototype.sanitize = function(nsfw: boolean) {
  return nsfw && this
    ? this.replace(badWordsRegex, function(a) {
        return '*'.repeat(a.length)
      }).toString()
    : this.toString()
}

/*
  As of React Native 0.64, we need to include the packageName with the testID
  in order for the element to reachable by waitForElementById.
*/
String.prototype.prependTestId = function () {
  return this.toString() ? `${Config.TEST_ID_RESOURCE_ID}:id/${this}` : ''
}

export {}