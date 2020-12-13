import React from "react";
import theme from "./styles/theme";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import SignUp from "./containers/SignUp";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Call from './containers/Call';

const GlobalStyle = createGlobalStyle`
  *,
  *::after,
  *::before {
      margin: 0;
      padding: 0;
      box-sizing: inherit;
  }

  html {
    font-size: 62.5%;
  }

  #root {
    height: 100vh;
  }
  
  body {
    height: 100vh;
    box-sizing: border-box;
    background-color: ${theme.colors.primary};
    font-family: ${theme.font};
    color: ${theme.colors.textDark}
  }
`;
const AppWrapper = styled.div`
  height: 100%;
`;

function App() {

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppWrapper>
        <Router>
          <Switch>
            <Route path="/create-call">
              <SignUp />
            </Route>
            <Route path="/join-call/:id">
              <SignUp isJoinCall={true} />
            </Route>
            <Route path="/call">
              <Call />
            </Route>
            <Route>
              <Redirect to="/create-call" />
            </Route>
          </Switch>
        </Router>
      </AppWrapper>
    </ThemeProvider>
  );
}

export default App;
