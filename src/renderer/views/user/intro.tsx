import * as React from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Divider,
  LinearProgress,
  Typography,
} from '@material-ui/core'

import * as electron from 'electron'

import {styles, Link, Step} from '../components'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {selectedKID} from '../state'
import {serviceName} from '../helper'

import {configSet, userService} from '../../rpc/rpc'

import {
  ConfigSetRequest,
  ConfigSetResponse,
  UserServiceRequest,
  UserServiceResponse,
  RPCState,
  RPCError,
} from '../../rpc/rpc'
import {AppState} from '../../reducers/app'
import {Key, User} from '../../rpc/types'

type Props = {
  open: boolean
  kid: string
  dispatch: (action: any) => any
}

type State = {
  loading: boolean
  error?: string
}

class UserIntroDialog extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  select = (service: string) => {
    this.setState({loading: true, error: ''})
    const req: UserServiceRequest = {
      kid: this.props.kid,
      service: service,
    }
    this.props.dispatch(
      userService(req, (resp: UserServiceResponse) => {
        this.setState({loading: false})
        this.props.dispatch(push('/user/name?kid=' + this.props.kid))
        this.close()
      })
    )
  }

  close = () => {
    this.props.dispatch({type: 'PROMPT_USER', payload: false})
  }

  nothanks = (skip: boolean) => {
    this.props.dispatch(
      configSet({key: 'disablePromptUser', value: skip ? '1' : '0'}, (resp: ConfigSetResponse) => {
        this.close()
      })
    )
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box display="flex" flex={1} flexDirection="column">
          <Typography
            id="alert-dialog-title"
            variant="h5"
            style={{paddingBottom: 7, paddingLeft: 20, paddingTop: 15, fontWeight: 600}}
          >
            Link your Key
          </Typography>
          {!this.state.loading && <Divider style={{marginBottom: 3}} />}
          {this.state.loading && <LinearProgress />}
        </Box>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Link your key with a Github or Twitter account by generating a signed message and posting it
            there. This helps others find your key and verify who you are. For more information, see{' '}
            <Link inline onClick={() => electron.shell.openExternal('https://docs.keys.pub/specs/user')}>
              docs.keys.pub/specs/user
            </Link>
            .
          </DialogContentText>
          <Box
            display="flex"
            flexDirection="column"
            style={{paddingTop: 10, paddingBottom: 20, alignItems: 'center'}}
          >
            <Button
              color="secondary"
              style={{
                color: styles.colors.github,
                border: '1px solid ' + styles.colors.github,
                // color: 'white',
                // backgroundColor: colorGithub,
                width: 300,
                height: 60,
                marginBottom: 20,
                textTransform: 'none',
                fontSize: 20,
                fontWeight: 500,
              }}
              onClick={() => this.select('github')}
            >
              <i className="fab fa-github" style={{color: styles.colors.github, fontSize: '2rem'}} /> &nbsp;
              Link to Github
            </Button>
            <Button
              color="primary"
              style={{
                color: styles.colors.twitter,
                border: '1px solid ' + styles.colors.twitter,
                // color: 'white',
                // backgroundColor: colorTwitter,
                width: 300,
                height: 60,
                marginBottom: 20,
                textTransform: 'none',
                fontSize: 20,
                fontWeight: 500,
              }}
              onClick={() => this.select('twitter')}
            >
              <i className="fab fa-twitter" style={{color: styles.colors.twitter, fontSize: '2rem'}} /> &nbsp;
              Link to Twitter
            </Button>

            <Typography>
              <Link
                inline={true}
                onClick={() => this.nothanks(false)}
                style={{width: 300, textAlign: 'center', marginTop: 10}}
              >
                Remind me later
              </Link>
              &nbsp; &mdash; &nbsp;
              <Link
                inline
                onClick={() => this.nothanks(true)}
                style={{width: 300, textAlign: 'center', marginTop: 20}}
              >
                Don't remind me
              </Link>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    open: false,
    kid: selectedKID(state),
  }
}

export default connect(mapStateToProps)(UserIntroDialog)