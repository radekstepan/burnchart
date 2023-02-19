import React from "react";
import Oatmilk from "oatmilk";
import RemountProvider from "./providers/RemountProvider";
import FirebaseProvider from "./providers/FirebaseProvider";
import Page from "./components/Page/Page";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import routes from "./routes";
import "./styles/app.less";
import "./styles/fonts.less";

function App() {
  return (
    <FirebaseProvider>
      <RemountProvider>
        <Oatmilk.Provider routes={routes}>
          <Header />
          <Page />
          <Footer />
        </Oatmilk.Provider>
      </RemountProvider>
    </FirebaseProvider>
  );
}

export default App;
