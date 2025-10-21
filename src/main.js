import './style.css';
import { createRandomPanel, updateCurrentState } from "./components/panel/panel.js";
import { setupKeyboardControls, setupTouchControls, setupMouseControls, setupScrollControls } from './events/controls.js';
import { setupActionBtns } from './events/actions.js';
import { loadContent } from './utils/loadContent.js';

async function init() {
  try {
    await loadContent();
    createRandomPanel();
    updateCurrentState();
    setupKeyboardControls();
    setupTouchControls();
    setupMouseControls();
    setupScrollControls();
    setupActionBtns();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

init();

