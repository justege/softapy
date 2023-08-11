import React from 'react';
import ReactDOM from 'react-dom';
import ConvertPopup from './ConvertPopup';
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'

const scriptElement = document.querySelector('script[name="convert-popup"]') as HTMLScriptElement;

const theme = extendTheme({
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Raleway', sans-serif`,
  },
})

// Retrieve the parameters from the script tag attributes
const userId = scriptElement.getAttribute('userId')  ?? '0';
const popupId = scriptElement.getAttribute('popupId')  ?? '0';

// Create the container element for the widget
const widgetContainer = document.createElement('div');
document.body.appendChild(widgetContainer);

// Render the ConvertPopup component with the parameters
ReactDOM.render(
  <ChakraProvider theme={theme}>
    <React.StrictMode>
      <ConvertPopup id={parseInt(userId) } popupId={parseInt(popupId)} />
    </React.StrictMode>
  </ChakraProvider>,
  widgetContainer
);
