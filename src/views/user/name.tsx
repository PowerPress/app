import * as React from 'react'

import {
  Box,
  Button,
  Checkbox,
  IconButton,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Snackbar,
  SnackbarContent,
  TextField,
  Typography,
} from '@material-ui/core'

import * as electron from 'electron'

import {styles, Link} from '../components'

import Step from '../components/step'

import {connect} from 'react-redux'
import {goBack, push} from 'connected-react-router'

import {selectedKID} from '../state'
import {serviceName} from '../helper'

import {configSet, keyGenerate, userAdd, userSign} from '../../rpc/rpc'

import {
  ConfigSetRequest,
  ConfigSetResponse,
  UserSignRequest,
  UserSignResponse,
  UserAddRequest,
  UserAddResponse,
  RPCError,
  RPCState,
} from '../../rpc/rpc'
import {AppState} from '../../reducers/app'
import {Key, User} from '../../rpc/types'

type Props = {
  kid: string
  service: string
  dispatch: (action: any) => any
}

type State = {
  name: string
  error: string
  loading: boolean
}

class UserNameView extends React.Component<Props, State> {
  state = {
    name: '',
    error: '',
    loading: false,
  }

  onNameChange = (e: React.SyntheticEvent<EventTarget>) => {
    let target = e.target as HTMLInputElement
    this.setState({name: target ? target.value : '', error: ''})
  }

  render() {
    const {service} = this.props

    if (service === '') {
      return <Typography>Unknown service</Typography>
    }

    let title = ''
    let placeholder = ''
    let question = "What's your username?"
    let next = "In the next step, we'll create a signed message that you can post to your account."
    if (service === 'github') {
      title = 'Link to Github'
      placeholder = 'username'
      question = "What's your Github username?"
      next =
        "In the next step, we'll create a signed message that you can post as a gist on your Github account."
    } else if (service === 'twitter') {
      title = 'Link to Twitter'
      placeholder = '@username'
      question = "What's your Twitter handle?"
      next = "In the next step, we'll create a signed message that you can post as a tweet."
    }

    return (
      <Step
        title={title}
        prev={{label: 'Back', action: () => this.props.dispatch(goBack())}}
        next={{label: 'Next', action: this.userInputNext}}
      >
        <Typography variant="subtitle1" style={{paddingBottom: 10}}>
          {question}
        </Typography>
        <FormControl error={this.state.error !== ''}>
          <TextField
            autoFocus
            placeholder={placeholder}
            onChange={this.onNameChange}
            value={this.state.name}
            style={{minWidth: 300}}
          />
          <FormHelperText id="component-error-text">{this.state.error}</FormHelperText>
        </FormControl>
        <Typography variant="body1" style={{paddingTop: 10, paddingBottom: 20}}>
          {next}
        </Typography>
      </Step>
    )
  }

  userInputNext = () => {
    if (this.state.name === '') {
      this.setState({
        error: 'Oops, name is empty',
      })
      return
    }

    this.setState({loading: true, error: ''})
    const req: UserSignRequest = {
      kid: this.props.kid,
      service: this.props.service,
      name: this.state.name,
    }
    this.props.dispatch(
      userSign(
        req,
        (resp: UserSignResponse) => {
          this.setState({loading: false})
          this.props.dispatch(push('/user/sign?kid=' + this.props.kid))
        },
        (err: RPCError) => {
          this.setState({loading: false, error: err.details})
        }
      )
    )
  }
}

const mapStateToProps = (state: {rpc: RPCState; router: any}, ownProps: any) => {
  return {
    kid: selectedKID(state),
    service: (state.rpc.userService && state.rpc.userService.service) || '',
  }
}

export default connect(mapStateToProps)(UserNameView)