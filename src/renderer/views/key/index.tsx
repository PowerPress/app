import * as React from 'react'

import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  MenuItem,
  Select,
  Slide,
  Typography,
} from '@material-ui/core'

import {TransitionProps} from '@material-ui/core/transitions'

import {DialogTitle} from '../../components'
import KeyView from './view'

import {goBack, push} from 'connected-react-router'
import {store} from '../../store'

import {key, keyRemove, pull} from '../../rpc/rpc'
import {RPCError, Key, KeyRequest, KeyResponse, PullRequest, PullResponse} from '../../rpc/types'

type Props = {
  open: boolean
  close: () => void
  kid: string
  update?: boolean
  source: 'search' | 'keys'
}

type State = {
  error: string
  loading: boolean
  key: Key
  openExport: boolean
  openRemove: boolean
}

// const transition = React.forwardRef<unknown, TransitionProps>(function Transition(props, ref) {
//   return <Slide direction="up" ref={ref} {...props} />
// })

export default class KeyDialog extends React.Component<Props, State> {
  state = {
    error: '',
    export: false,
    loading: false,
    key: null,
    openExport: false,
    openRemove: false,
  }

  close = () => {
    this.props.close()
  }

  componentDidUpdate(prevProps: Props, prevState: any, snapshot: any) {
    if (this.props.kid !== prevProps.kid) {
      this.loadKey()
    }
  }

  loadKey = () => {
    if (!this.props.kid) {
      this.setState({key: null})
      return
    }

    this.setState({loading: this.props.update, error: ''})
    const req: KeyRequest = {
      identity: this.props.kid,
      update: this.props.update,
    }
    key(req, (err: RPCError, resp: KeyResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      if (resp.key) {
        this.setState({key: resp.key, loading: false})
      } else {
        this.setState({error: 'Key not found', loading: false})
      }
    })
  }

  import = () => {
    this.setState({loading: true, error: ''})
    const req: PullRequest = {
      identity: this.props.kid,
    }
    pull(req, (err: RPCError, resp: PullResponse) => {
      if (err) {
        this.setState({loading: false, error: err.details})
        return
      }
      this.setState({loading: false})
      this.close()
    })
  }

  render() {
    return (
      <Dialog
        onClose={this.close}
        open={this.props.open}
        maxWidth="sm"
        fullWidth
        disableBackdropClick
        // TransitionComponent={transition}
        keepMounted
      >
        <DialogTitle loading={this.state.loading}>Key</DialogTitle>
        <DialogContent dividers style={{minHeight: 155}}>
          {this.state.error && <Typography style={{color: 'red'}}>{this.state.error}</Typography>}
          {this.state.key && <KeyView value={this.state.key} />}
        </DialogContent>
        <DialogActions>
          {this.props.source == 'search' && (
            <Box display="flex" flexDirection="row">
              <Button onClick={this.close}>Close</Button>
              <Button color="primary" onClick={this.import} disabled={this.state.loading}>
                Import
              </Button>
            </Box>
          )}
          {this.props.source != 'search' && <Button onClick={this.close}>Close</Button>}
        </DialogActions>
      </Dialog>
    )
  }
}

// const mapStateToProps = (state: {router: any}, ownProps: any) => {
//   return {
//     kid: query(state, 'kid'),
//     update: query(state, 'update') == '1',
//   }
// }

// export default connect(mapStateToProps)(KeyIndexView)
