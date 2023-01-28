import React, {memo, useEffect, useState} from 'react';
import './icon.less';

// Fontello icon hex codes.
const CODES = {
  'delete':    '\e800', // Font Awesome - trash-empty
  'settings':  '\e801', // Font Awesome - cog
  'pencil':    '\e802', // Font Awesome - pencil
  'menu':      '\e803', // Font Awesome - menu
  'wrench':    '\e804', // Font Awesome - wrench
  'protip':    '\e805', // Font Awesome - graduation-cap
  'plus':      '\e806', // Font Awesome - plus-circled
  'rocket':    '\e807', // Font Awesome - rocket
  'computer':  '\e808', // Font Awesome - desktop
  'signout':   '\e809', // Font Awesome - logout
  'github':    '\e80a', // Font Awesome - github
  'warning':   '\e80b', // Entypo - attention
  'direction': '\e80c', // Entypo - address
  'megaphone': '\e80d', // Entypo - megaphone
  'sort':      '\e80e', // Typicons - sort-alphabet
  'spinner':   '\e80f', // MFG Labs - spinner1
  'fire':      '\e810'  // Maki - fire-station
};

function Icon({name}) {
  if (name && name in CODES) {
    const code = parseInt(CODES[name], 16);
    return name;
    return (
      <span
        className={`icon--family-fontello icon__${name}`}
        dangerouslySetInnerHTML={{ '__html': `&#${code};` }}
      />
    );
  }

  return null;
}

export default Icon;
