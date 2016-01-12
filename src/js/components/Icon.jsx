import React from 'react';

import Format from '../mixins/Format.js';

// Fontello icon hex codes.
let codes = {
  'spyglass':  '\e801', // Font Awesome - search
  'plus':      '\e804', // Font Awesome - plus-circled
  'settings':  '\e800', // Font Awesome - cog
  'rocket':    '\e80a', // Font Awesome - rocket
  'computer':  '\e807', // Font Awesome - desktop
  'help':      '\e80f', // Font Awesome - lifebuoy
  'signout':   '\e809', // Font Awesome - logout
  'github':    '\e802', // Font Awesome - github
  'warning':   '\e80c', // Entypo - attention
  'direction': '\e803', // Entypo - address
  'megaphone': '\e808', // Entypo - megaphone
  'heart':     '\e80e', // Typicons - heart
  'sort':      '\e806', // Typicons - sort-alphabet
  'spinner':   '\e80b', // MFG Labs - spinner1
  'fire':      '\e805'  // Maki - fire-station
};

export default React.createClass({

  displayName: 'Icon.jsx',
  
  mixins: [ Format ],

  render() {
    let name = this.props.name;

    if (name && name in codes) {
      let code = this._hexToDec(codes[name]);
      return (
        <span
          className={'icon ' + name}
          dangerouslySetInnerHTML={{ '__html': '&#' + code + ';' }}
        />
      );
    }

    return false;
  }

});
