import React from 'react';
import ReactDOM from 'react-dom';
import ConvertPopup from './ConvertPopup';
import { ChakraProvider } from "@chakra-ui/react";



window.addEventListener('DOMContentLoaded', function () {
  const widgets = document.querySelectorAll('.convert-popup');

  widgets.forEach(widget => {
    const appContainer = document.createElement('div');
    widget.appendChild(appContainer);

    ReactDOM.render(
      <ChakraProvider>
      <React.StrictMode>
        <ConvertPopup widget={widget as HTMLElement} />
      </React.StrictMode>
    </ChakraProvider>,
      appContainer
    );
  });
});

