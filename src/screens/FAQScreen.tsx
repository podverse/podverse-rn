import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, View, WebViewStaticHTML } from '../components'
import { gaTrackPageView } from '../services/googleAnalytics'

type Props = {}

type State = {
  isLoading: boolean
}

export class FAQScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'FAQ'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    gaTrackPageView('/faq', 'FAQ Screen')

    setTimeout(() => {
      this.setState({ isLoading: false })
    }, 1250)
  }

  render() {
    const { isLoading } = this.state

    return (
      <View style={styles.view}>
        {isLoading && <ActivityIndicator />}
        <WebViewStaticHTML html={html} isLoading={isLoading} />
      </View>
    )
  }
}

const html = `

  <ul>
    <li>
      <a href='#dyanmic-ads'>Dynamic ads: Why do some clips start at the wrong time?</a>
    </li>
    <li>
      <a href='#what-does-open-source-mean'>What does open source mean?</a>
    </li>
    <li>
      <a href='#why-is-podverse-open-source'>Why is Podverse open source?</a>
    </li>
  </ul>

  <hr />

  <h2
    className='offset-anchor-tag'
    id='dyanmic-ads'>
Dynamic ads: Why do some clips start at the wrong time?
  </h2>

  <p>
Podverse clips should work reliably for the majority of
podcasts that do not use dynamic ads, but the start times of clips from shows
that use dynamic ads will not stay accurate.
  </p>
  <p>
Podcasts that use dyanmic ads rotate different ads into the same episode.
Since we can't predict which ads each listener will get or how long they will be,
we can't determine the correct clip start time for all listeners.
  </p>
  <p>
We would love to add full support for podcasts that use dynamic ads some day,
but we will need to collaborate with podcasters and their ad networks to do so.
  </p>

  <hr />

  <h2
    className='offset-anchor-tag'
    id='what-does-open-source-mean'>
What does open source (AGPLv3) mean?
  </h2>

  <p>
AGPLv3 is the open source license under which all Podverse software is provided.
The license states that anyone can download, modify, and use this software for any purposes for free,
as long as they also share their changes to the code.
This is also known as a "share-alike" or "copyleft" license.
  </p>

  <hr />

  <h2
    className='offset-anchor-tag'
    id='why-is-podverse-open-source'>
Why is Podverse open source?
  </h2>

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
