
import { createRoot } from 'react-dom/client';
import React from 'react';
import TurrexButton from './TurrexButton';

function Root() {
  return (
    <TurrexButton/>
  );
}

export function DrawTurrexButton(element) {
  console.log('DrawTurrexButton in ', element);
  const turrexButtonDiv = document.createElement("div");
  element.insertAdjacentElement("afterbegin", turrexButtonDiv);
  const root = createRoot(turrexButtonDiv);
  root.render(<Root/>);
}

