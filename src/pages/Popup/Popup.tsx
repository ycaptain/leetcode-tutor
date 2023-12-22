import React, { useEffect } from 'react'
import { ProblemList } from '../../components/ProblemList'
import { TestTabs } from '../../components/Tabs/tabs'
import './index.css'

function Popup() {
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('msg receive from popup', request)

      sendResponse({
        asd: 'zxc'
      }) // this is how you send message to popup

      return true // this make sure sendResponse will work asynchronously
    })
  })

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <ProblemList />
      <TestTabs />
    </div>
  )
}

export default Popup
