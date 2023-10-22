
import { createRoot } from 'react-dom/client';
import React from 'react';
import TurrexUI from './TurrexUI';

function Root() {
  return (
    <TurrexUI/>
  );
}

export function DrawTurrexUI(element) {
  console.log('DrawTurrexButton in ', element);
  const turrexButtonDiv = document.createElement("div");
  element.insertAdjacentElement("afterbegin", turrexButtonDiv);
  const root = createRoot(turrexButtonDiv);
  root.render(<Root/>);
}

