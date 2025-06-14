import browser from 'webextension-polyfill'

browser.runtime.onInstalled.addListener(() => {
  console.log('concopy installed 🦊')
})

browser.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    browser.action.openPopup()
  }
})