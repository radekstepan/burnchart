import React, {memo, useEffect, useState} from 'react';
import {ThemeProvider, defaultTheme} from 'evergreen-ui';
import Oatmilk from 'oatmilk'
import FirebaseProvider from './providers/FirebaseProvider';
import Header from './components/Header';
import Content from './components/Content';
import Footer from './components/Footer';
import routes from './routes';

function App() {
  return (
    <ThemeProvider value={defaultTheme}>
      <FirebaseProvider>
        <Oatmilk.Provider routes={routes}>
          <Header />
          <Content />
          <Footer />
        </Oatmilk.Provider>
      </FirebaseProvider>
    </ThemeProvider>
  )
}

export default App;
