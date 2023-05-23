import React from 'react';
import ReactDOM from 'react-dom';
import SoftapyWidget from './SoftapyWidget';
import { ChakraProvider } from "@chakra-ui/react";



window.addEventListener('DOMContentLoaded', function () {
  const widgets = document.querySelectorAll('.softapy-widget');

  widgets.forEach(widget => {
    const appContainer = document.createElement('div');
    widget.appendChild(appContainer);

    ReactDOM.render(
      <ChakraProvider>
      <React.StrictMode>
        <SoftapyWidget widget={widget as HTMLElement} />
      </React.StrictMode>
    </ChakraProvider>,
      appContainer
    );
  });
});

