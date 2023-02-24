import React from "react";
import RemountProvider from "./providers/RemountProvider";
import FirebaseProvider from "./providers/FirebaseProvider";
import Page from "./components/Page/Page";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import "./styles/app.less";
import "./styles/fonts.less";

function App() {
  return (
    <FirebaseProvider>
      <RemountProvider>
        <Header />
        <Page />
        <Footer />
      </RemountProvider>
    </FirebaseProvider>
  );
}

export default App;
