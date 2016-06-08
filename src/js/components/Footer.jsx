import React from 'react';

export default class Footer extends React.Component {

  displayName: 'Footer.jsx'

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="footer">
        <div className="wrap">
          &copy; 2012-2016 <a href="https:/radekstepan.com" target="_blank">Radek Stepan</a>
        </div>
      </div>
    );
  }

}
