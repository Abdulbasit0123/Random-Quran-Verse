import './style.css';
import { createRandomPanel, updateCurrentState } from "./components/panel/panel.js";
import { setupKeyboardControls, setupTouchControls, setupMouseControls, setupScrollControls } from './events/controls.js';
import { setupActionBtns } from './events/actions.js';
import { loadContent } from './utils/loadContent.js';
import { showError } from './utils/loadingIcon.js';

async function init() {
  try {
    createRandomPanel();
    updateCurrentState();
    setupKeyboardControls();
    setupTouchControls();
    setupMouseControls();
    setupScrollControls();
    setupActionBtns();
    loadContent();
  } catch (error) {
    showError();
    console.error('Error initializing app:', error);
  }
}

init();

