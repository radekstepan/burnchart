import React, {memo, useEffect, useState} from 'react';
import Oatmilk from 'oatmilk'
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import routes from './routes';

function App() {
  return (
    <Oatmilk.Provider routes={routes}>
      <Header />
      <Content />
      <Footer />
    </Oatmilk.Provider>
  )
}

export default App;
