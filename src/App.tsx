import React from "react";
import Oatmilk from "oatmilk";
import FirebaseProvider from "./providers/FirebaseProvider";
import Page from "./components/Page";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import routes from "./routes";
import "./styles/app.less";
import "./styles/fonts.less";

function App() {
  return (
    <FirebaseProvider>
      <Oatmilk.Provider routes={routes}>
        <Header />
        <Page />
        <Footer />
      </Oatmilk.Provider>
    </FirebaseProvider>
  );
}

export default App;
