import React, {memo, useEffect, useState} from 'react';
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';

function App() {
  return (
    <div id="app">
      <Header />
      <Content />
      <Footer />
    </div>
  )
}

export default App;
