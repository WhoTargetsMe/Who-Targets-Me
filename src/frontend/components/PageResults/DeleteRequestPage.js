import React, { Component } from 'react';
import { Button } from 'elemental'
import strings from '../../helpers/localization.js';
import './PageResults.css';

export const DeleteRequestPage = (props) => {
  return (
    <div className='deleteRequestContainer'>
      <div className='column'>
        <Button type="hollow-danger" className='buttonRed' onClick={(e) => props.confirmDeleteData(e)}>{strings.results.delete_data}</Button>
        <p>{strings.results.delete_data_message}</p>
      </div>
      <div className='column'>
        <Button type="hollow-primary" className='buttonGrey'>{strings.results.remove_WTM}</Button>
        <p>{strings.results.remove_WTM_message}</p>
        <p>{strings.results.remove_WTM_message2}</p>
      </div>
      <div className='column'>
        <Button type="hollow-primary" className='buttonCancel' onClick={(e) => props.cancelDeleteRequestPage(e)}>{strings.results.cancel}</Button>
        <p>{strings.results.cancel_message}</p>
      </div>
    </div>
  )
}
