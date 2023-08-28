/* eslint-disable @typescript-eslint/no-empty-interface */

import React from 'reactn'

interface Props {}
interface State {}

/* 
  NOTE: the PLAYER_HISTORY_INDEX_DID_UPDATE is heavy on the JS fps usage.
  I'm commenting it out because it hampers performance and maybe we won't miss it.
*/
export class HistoryIndexListenerScreen extends React.Component<Props, State> {
  componentDidMount() {
    // Updates to historyItemsIndex do not force this component to re-render,
    // so we force it to re-render on the PLAYER_HISTORY_INDEX_DID_UPDATE event.
    // PVEventEmitter.on(PV.Events.PLAYER_HISTORY_INDEX_DID_UPDATE, () => this.forceUpdate())
  }

  componentWillUnmount() {
    // PVEventEmitter.removeListener(PV.Events.PLAYER_HISTORY_INDEX_DID_UPDATE)
  }
}
