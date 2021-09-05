import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, View, WebViewStaticHTML } from '../components'
import { trackPageView } from '../services/tracking'

type Props = any

type State = {
  isLoading: boolean
}

const testIDPrefix = 'faq_screen'

export class FAQScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  static navigationOptions = () => ({
      title: 'FAQ'
    })

  componentDidMount() {
    trackPageView('/faq', 'FAQ Screen')

    setTimeout(() => {
      this.setState({ isLoading: false })
    }, 1250)
  }

  render() {
    const { isLoading } = this.state

    return (
      <View
        style={styles.view}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        <WebViewStaticHTML html={html} isLoading={isLoading} />
      </View>
    )
  }
}

const html = `

  <ul>
    <li>
      <a href='#why-do-some-clips-start-at-the-wrong-time'>Why do some clips start at the wrong time?</a>
    </li>
    <li>
      <a href='#what-does-open-source-mean'>What does open source mean?</a>
    </li>
    <li>
      <a href='#why-is-podverse-open-source'>Why is Podverse open source?</a>
    </li>
  </ul>

  <hr />

  <h1
    className='offset-anchor-tag'
    id='why-do-some-clips-start-at-the-wrong-time'>
Why do some clips start at the wrong time?
  </h1>

  <p>
Most podcast apps today limit your clips to be less than a minute long,
but Podverse lets you create and share podcast clips of any length.
This approach for clip sharing has a tradeoff however,
as it currently does not support clips from podcasts that insert dynamic ads.
  </p>
  <p>
Dynamic ads are different advertisements that are rotated into the same episode,
so each listener can hear a different series of advertisements.
Since dynamic ads change the overall length of the episode,
the timestamps of clips created from that episode will not stay accurate.
  </p>
  <p>
We would love to add full support for podcasts with dynamic ads some day, and we can,
but for fair use / legal reasons we will need to get permission from each podcaster to do so.
  </p>
  
  <hr />

  <h1
    className='offset-anchor-tag'
    id='what-does-open-source-mean'>
What does open source (AGPLv3) mean?
  </h1>

  <p>
AGPLv3 is the open source license under which all Podverse software is provided.
The license states that anyone can download, modify, and use this software for any purposes for free,
as long as they also share their changes to the code.
This is also known as a "share-alike" or "copyleft" license.
  </p>

  <hr />

  <h1
    className='offset-anchor-tag'
    id='why-is-podverse-open-source'>
Why is Podverse open source?
  </h1>

  <p>
Podverse software is open source so anyone can launch their own
podcast app as affordably as possible. If a podcast network wants to create their own podcast app,
they can use Podverse software and do it for a tiny fraction of the cost
of hiring programmers to build a podcast app from scratch.
  </p>
  <p>
Our goal is to help level the playing field between the corporate world and independent media,
so independent media has the same technological advantages as large corporations,
and open source software is essential to that mission.
  </p>
`

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
