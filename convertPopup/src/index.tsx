import React from 'react';
import ReactDOM from 'react-dom';
import ConvertPopup from './ConvertPopup';
import { ChakraProvider } from "@chakra-ui/react";
import './setupProxy';

const scriptElement = document.querySelector('script[name="convert-popup"]') as HTMLScriptElement;

// Retrieve the parameters from the script tag attributes
const userId = scriptElement.getAttribute('userId')  ?? '0';
const popupId = scriptElement.getAttribute('popupId')  ?? '0';

// Create the container element for the widget
const widgetContainer = document.createElement('div');
document.body.appendChild(widgetContainer);

// Render the ConvertPopup component with the parameters
ReactDOM.render(
  <ChakraProvider>
    <React.StrictMode>
      <ConvertPopup id={parseInt(userId) } popupId={parseInt(popupId)} />
    </React.StrictMode>
  </ChakraProvider>,
  widgetContainer
);
