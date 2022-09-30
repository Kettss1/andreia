import React from 'react';
import './button.scss';

interface ButtonProps {
  label: string;
  icon?: string;
}


export default class Button extends React.Component<ButtonProps> {
  render() {
    return (
      <button
        type="button"
        // className={}
      >
        <p>
          {this.props.label}
        </p>
        {/* {this.icon && (img)} */}
      </button>
    )
  }
}
