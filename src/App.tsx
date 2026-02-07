import React from "react";
import RemountProvider from "./providers/RemountProvider";
import AuthProvider from "./providers/AuthProvider";
import Page from "./components/Page/Page";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./styles/app.less";
import "./styles/fonts.less";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RemountProvider>
          <Header />
          <Page />
          <Footer />
        </RemountProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
