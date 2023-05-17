import React from 'react';
import ReactDOM from 'react-dom';
import PrototurkWidget from './PrototurkWidget';
import { ChakraProvider } from "@chakra-ui/react";

const widgets = document.querySelectorAll('.prototurk-widget')


window.addEventListener('DOMContentLoaded', function () {
  const widgets = document.querySelectorAll('.prototurk-widget');

  widgets.forEach(widget => {
    const appContainer = document.createElement('div');
    widget.appendChild(appContainer);

    ReactDOM.render(
      <ChakraProvider>
      <React.StrictMode>
        <PrototurkWidget widget={widget as HTMLElement} />
      </React.StrictMode>
    </ChakraProvider>,
      appContainer
    );
  });
});

