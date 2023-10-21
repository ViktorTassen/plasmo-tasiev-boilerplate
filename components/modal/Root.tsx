
import { createRoot } from 'react-dom/client';
import React from 'react';
import Modal from './Modal';

function Root() {
  return (
    <Modal/>
  );
}

export function DrawModal(element) {
  console.log('DrawModal in ', element);
  const modalDiv = document.createElement("div");
  element.insertAdjacentElement("afterbegin", modalDiv);
  const root = createRoot(modalDiv);
  root.render(<Root/>);
}

