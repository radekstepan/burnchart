import React, {memo, useEffect, useState} from 'react';
import {ThemeProvider, defaultTheme} from 'evergreen-ui';
import Oatmilk from 'oatmilk'
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import routes from './routes';

function App() {
  return (
    <ThemeProvider value={defaultTheme}>
      <Oatmilk.Provider routes={routes}>
        <Header />
        <Content />
        <Footer />
      </Oatmilk.Provider>
    </ThemeProvider>
  )
}

export default App;
