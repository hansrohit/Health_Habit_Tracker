import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { extendTheme } from "@chakra-ui/react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "./assets/css/index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./state/store";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "black",
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ChakraProvider theme={theme}>
    <Provider store={store}>
      <App />
    </Provider>
  </ChakraProvider>
  // </StrictMode>
);
