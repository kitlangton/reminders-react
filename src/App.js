import React, { Component } from 'react'
import $ from 'jquery'
import { Spring, Transition } from 'react-spring'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import lightbulb from './lightbulb.svg'
import Popover from 'react-popover'
import _ from 'lodash'
const rp = require('request-promise')

class App extends Component {
  state = {
    reminderText: '',
    newRecipient: '',
    showLeft: true,
    overflow: false,
    reminders: [],
    newestReminderID: null,
    recipients: [],
    date: moment(),
    open: false
  }

  open = () => this.setState({ open: true })
  close = () => this.setState({ open: false })

  componentDidMount = () => {
    this.fetchReminders()
  }

  removeRecipient = recipient => {
    let { recipients } = this.state
    const index = recipients.indexOf(recipient)
    recipients.splice(index, 1)
    this.setState({ recipients })
  }

  fetchReminders = () => {
    return rp({
      json: true,
      method: 'GET',
      uri: window.location.origin + '/reminders'
    }).then(({ data }) => {
      const reminders = data.map(r => ({
        ...r,
        due: moment(r.due)
      }))

      this.setState({ reminders })
    })
  }

  postReminder = () => {
    const { recipients, date, reminderText } = this.state

    return rp({
      uri: window.location.origin + '/reminders',
      body: {
        reminder: {
          recipients,
          due: date.format(),
          body: reminderText
        }
      },
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST' // *GET, POST, PUT, DELETE, etc.
    })
      .then(({ data: reminder }) => {
        this.setState({
          recipients: [],
          newRecipient: '',
          date: moment(),
          reminderText: '',
          newestReminderID: reminder.id
        })
      })
      .then(() => {
        this.fetchReminders().then(() => {
          this.setState({ showLeft: false })
        })
      })
  }

  handleTextChange = ({ target }) => {
    target.style.height = 0
    target.style.height = `${target.scrollHeight}px`
    this.setState({
      reminderText: target.value
    })
  }

  sections = () => (this.state.showLeft ? ['New Reminder'] : ['All Reminders'])
  buttons = () => (this.state.showLeft ? ['All Reminders'] : ['New Reminder'])

  render() {
    const {
      reminderText,
      date,
      recipients,
      newRecipient,
      newestReminderID,
      reminders,
      open
    } = this.state

    return (
      <Spring
        from={{
          maxWidth: 0,
          opacity: 0
        }}
        to={{
          maxWidth: open ? 400 : 0,
          opacity: open ? 1 : 0
        }}
      >
        {styles => (
          <div
            className='reminders-container'
            style={{
              opacity: styles.opacity,
              pointerEvents: open ? 'all' : 'none'
            }}
          >
            <div
              className='reminders'
              style={{
                ...styles,
                overflow: this.state.overflow ? 'visible' : 'hidden'
              }}
            >
              <div className='reminders-header'>
                <img className='reminders-image' src={lightbulb} alt='' />
                <div className='reminders-title'>
                  <Transition
                    keys={this.sections().map(item => item)}
                    from={{ opacity: 0, height: 0 }}
                    enter={{ opacity: 1, height: 16 }}
                    leave={{ opacity: 0, height: 0 }}
                  >
                    {this.sections().map(section => styles => (
                      <div style={styles}>{section}</div>
                    ))}
                  </Transition>
                </div>
                <div
                  className='reminders-button reminders-button-gray header-right'
                  onClick={() =>
                    this.setState({ showLeft: !this.state.showLeft })
                  }
                >
                  <Transition
                    keys={this.buttons().map(item => item)}
                    from={{ opacity: 0, height: 0 }}
                    enter={{ opacity: 1, height: 16 }}
                    leave={{ opacity: 0, height: 0 }}
                  >
                    {this.buttons().map(section => styles => (
                      <div style={styles}>{section}</div>
                    ))}
                  </Transition>
                </div>
                <div
                  className='close-button'
                  onClick={() => this.setState({ open: false })}
                >
                  &#10006;
                </div>
              </div>

              <Spring
                to={{
                  transform: this.state.showLeft ? 0 : -50,
                  height: this.state.showLeft ? 200 : 400,
                  opacity: this.state.showLeft ? 1 : 0
                }}
              >
                {styles => (
                  <div
                    className='reminders-splitview'
                    style={{
                      transform: `translateX(${styles.transform}%)`
                    }}
                  >
                    <div className='split1' style={{ opacity: styles.opacity }}>
                      <NewReminder
                        handleTextChange={this.handleTextChange}
                        handleDateChange={date => this.setState({ date })}
                        handleFocus={bool => this.setState({ overflow: bool })}
                        handleNewRecipientChange={newRecipient => {
                          this.setState({ newRecipient })
                        }}
                        handleAddRecipient={recipient => {
                          this.setState({
                            recipients: [...recipients, recipient],
                            newRecipient: ''
                          })
                        }}
                        handlePostReminder={this.postReminder}
                        newRecipient={newRecipient}
                        reminderText={reminderText}
                        recipients={recipients}
                        removeRecipient={this.removeRecipient}
                        date={date}
                      />
                    </div>
                    <div
                      className='split2'
                      style={{
                        maxHeight: styles.height,
                        opacity: 1 - styles.opacity
                      }}
                    >
                      <div className='reminders-body'>
                        <div className='reminders-list'>
                          {reminders.map(reminder => (
                            <Reminder
                              key={reminder.id}
                              {...reminder}
                              newestReminderID={newestReminderID}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Spring>
            </div>
          </div>
        )}
      </Spring>
    )
  }
}

class NewReminder extends Component {
  render = () => {
    let {
      handleTextChange,
      handleDateChange,
      handleNewRecipientChange,
      handleAddRecipient,
      handlePostReminder,
      reminderText,
      newRecipient,
      recipients,
      removeRecipient,
      date,
      handleFocus
    } = this.props
    return (
      <div className='reminders-body'>
        <textarea
          onChange={handleTextChange}
          className='reminders-text-input'
          placeholder='Remind me to...'
          rows={1}
          value={reminderText}
          autoFocus={true}
        />
        <div className='hr' />
        <div className='reminders-section'>
          <div className='reminders-section-title'>Remind Date</div>
          <div className='reminders-section-control'>
            <DatePicker
              selected={date}
              onFocus={() => handleFocus(true)}
              onBlur={() => handleFocus(false)}
              onChange={handleDateChange}
              className='reminders-date'
              dateFormat='LL'
              minDate={moment()}
            />
          </div>
        </div>
        <div className='hr' />
        <div className='reminders-section'>
          <div className='reminders-section-title'>Recipients</div>
          <div className='reminders-section-recipients'>
            <Transition
              keys={recipients.map(item => item)}
              from={{ opacity: 0, height: 0 }}
              enter={{ opacity: 1, height: 20 }}
              leave={{ opacity: 0, height: 0 }}
            >
              {recipients.map(recipient => styles => (
                <div style={styles} className='reminders-recipient'>
                  <div
                    className='reminders-recipient-name'
                    onClick={() => removeRecipient(recipient)}
                  >
                    {recipient}
                  </div>
                </div>
              ))}
            </Transition>

            <RecipientAutocomplete
              newRecipient={newRecipient}
              handleNewRecipientChange={handleNewRecipientChange}
              handleAddRecipient={handleAddRecipient}
              handleFocus={handleFocus}
              recipients={recipients}
            />
          </div>
        </div>
        <div className='hr' />
        <div className='reminders-section'>
          <div className='reminders-button' onClick={handlePostReminder}>
            Create Reminder
          </div>
        </div>
      </div>
    )
  }
}

class RecipientAutocomplete extends Component {
  state = {
    suggestions: [],
    selectedIndex: 0,
    focused: false
  }

  fetchSuggestions = _.debounce(login => {
    return rp({
      json: true,
      method: 'GET',
      uri: window.location.origin + '/users?login=' + login
    }).then(({ data }) => {
      this.setState({ suggestions: data })
    })
  }, 300)

  matchingSuggestions = () => {
    let { newRecipient, recipients } = this.props
    if (newRecipient.length < 2) return []
    let { suggestions } = this.state
    return suggestions.filter(({ login }) => {
      if (recipients.includes(login)) return false
      return login.toLowerCase().startsWith(newRecipient.toLowerCase())
    })
  }

  componentDidUpdate(prevProps) {
    if (this.props.newRecipient !== prevProps.newRecipient) {
      this.fetchSuggestions(this.props.newRecipient)
    }
  }

  render() {
    let {
      newRecipient,
      handleNewRecipientChange,
      handleAddRecipient,
      handleFocus
    } = this.props

    let { focused, selectedIndex, suggestions } = this.state
    let renderedSuggestions = this.matchingSuggestions()

    return (
      <div>
        <input
          placeholder='New Recipient'
          className='add-recipient reminders-recipient'
          value={newRecipient}
          onChange={e => handleNewRecipientChange(e.target.value)}
          onFocus={() => {
            this.setState({ focused: true })
            handleFocus(true)
          }}
          onBlur={() => {
            this.setState({ focused: false })
            handleFocus(false)
          }}
          onKeyDown={e => {
            switch (e.key) {
              case 'ArrowUp':
                this.setState({ selectedIndex: Math.max(selectedIndex - 1, 0) })
                e.preventDefault()
                break
              case 'ArrowDown':
                this.setState({
                  selectedIndex: Math.min(
                    selectedIndex + 1,
                    renderedSuggestions.length - 1
                  )
                })
                e.preventDefault()
                break
              default:
                break
            }
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              let recipient = renderedSuggestions[selectedIndex]
              if (recipient && recipient.login) {
                handleAddRecipient(recipient.login)
              }
            }
          }}
        />
        {focused && renderedSuggestions.length ? (
          <div className='autocomplete-list'>
            {renderedSuggestions.map(
              (
                { login, first_name: firstName, last_name: lastName },
                index
              ) => (
                <div
                  key={login}
                  className={
                    'autocomplete-suggestion ' +
                    (index === selectedIndex ? 'autocomplete-selected' : '')
                  }
                >
                  <div className='suggestion-login'>{login}</div>
                  <div className='suggestion-name'>
                    {firstName} {lastName}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

class Reminder extends Component {
  state = {
    toggled: false
  }

  componentDidMount = () => {
    let { id, newestReminderID } = this.props
    setTimeout(() => {
      if (id === newestReminderID) {
        $('.split2').animate(
          {
            scrollTop:
              $('#newest-reminder').offset().top + $('.split2').scrollTop()
          },
          1000
        )
      }
    }, 400)
  }

  render = () => {
    let { due, recipients, body, id, newestReminderID } = this.props
    return (
      <div
        className='reminder'
        id={newestReminderID === id ? 'newest-reminder' : ''}
      >
        <div className='reminder-header'>
          <div className='reminder-date'>{due.format('LL')}</div>
          {recipients.length ? (
            <Popover
              body={
                <div className='recipient-popover'>
                  {recipients.map(recipient => (
                    <div
                      key={recipient}
                      className='recipient-popover-recipient'
                    >
                      {recipient}
                    </div>
                  ))}
                </div>
              }
              isOpen={this.state.toggled}
            >
              <div
                className='reminder-recipients'
                onMouseOver={() => this.setState({ toggled: true })}
                onMouseLeave={() => this.setState({ toggled: false })}
              >
                {recipients.length} Recipients
              </div>
            </Popover>
          ) : (
            ''
          )}
        </div>
        <div className='reminder-body'>{body}</div>
      </div>
    )
  }
}

export default App
