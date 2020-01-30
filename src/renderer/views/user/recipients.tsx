import * as React from 'react'

import {TextField, Typography} from '@material-ui/core'
import {Face as FaceIcon} from '@material-ui/icons'

import Autocomplete from '@material-ui/lab/Autocomplete'

import {store} from '../../store'

import UserLabel from './label'

import {userSearch, RPCError, RPCState} from '../../rpc/rpc'
import {UserSearchResult, UserSearchRequest, UserSearchResponse} from '../../rpc/types'
import {styles} from '../../components'

export type Props = {
  onChange?: (value: UserSearchResult[]) => void
}

type State = {
  open: boolean
  loading: boolean
  options: UserSearchResult[]
  selected: UserSearchResult[]
  error: string
}

export default class RecipientsView extends React.Component<Props, State> {
  state = {
    open: false,
    loading: false,
    options: [],
    selected: [],
    error: '',
  }

  componentDidMount() {
    this.search('')
  }

  search = (q: string) => {
    this.setState({loading: true}) // , options: []
    const req: UserSearchRequest = {query: q, limit: 100}
    store.dispatch(
      userSearch(
        req,
        (resp: UserSearchResponse) => {
          this.setState({options: resp.results || [], loading: false})
        },
        (err: RPCError) => {
          this.setState({error: err.details, loading: false})
        }
      )
    )
  }

  openAutoComplete = () => {
    this.search('')
    this.setState({open: true})
  }

  onInputChange = (event: React.ChangeEvent<{}>, value: string, reason: 'input' | 'reset') => {
    this.search(value)
  }

  onChange = (event: React.ChangeEvent<{}>, value: UserSearchResult[]) => {
    this.setState({selected: value})
    if (!!this.props.onChange) {
      this.props.onChange(value)
    }
  }

  renderOption = (option: UserSearchResult) => {
    return (
      <React.Fragment>
        <UserLabel kid={option.kid} user={option.user} />
      </React.Fragment>
    )
  }

  optionSelected = (option: UserSearchResult, value: UserSearchResult) => {
    return option.kid === value.kid && option.user.label === value.user.label
  }

  render() {
    const {open, loading, options} = this.state
    return (
      <Autocomplete
        open={open}
        multiple
        onOpen={this.openAutoComplete}
        onClose={() => {
          this.setState({open: false})
        }}
        onInputChange={this.onInputChange}
        onChange={this.onChange}
        value={this.state.selected}
        getOptionSelected={this.optionSelected}
        getOptionLabel={(option: UserSearchResult) =>
          ((<UserLabel kid={option.kid} user={option.user} />) as unknown) as string
        }
        options={options}
        ChipProps={{variant: 'outlined', size: 'small'}} //  icon: <FaceIcon />,
        renderOption={this.renderOption}
        renderInput={params => (
          <TextField
            {...params}
            placeholder="Recipients"
            fullWidth
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              // endAdornment: (
              //   <React.Fragment>
              //     {loading ? <CircularProgress color="inherit" size={20} /> : null}
              //     {params.InputProps.endAdornment}
              //   </React.Fragment>
              // ),
            }}
          />
        )}
      />
    )
  }
}

const ChipLabel = (props: {children?: any}) => {
  console.log('chip props:', props)
  return <Typography style={{...styles.mono}}>{props.children}</Typography>
}
