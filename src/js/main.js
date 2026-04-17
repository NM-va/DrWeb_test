import "virtual:svg-icons-register";
import "../scss/style.scss";
import MatrixGlow from './matrix-glow.js';
import { initFormBannerValidation } from "./formBannerValidation.js";
import { initRegistrationModals } from "./registrationModals.js";

document.addEventListener("DOMContentLoaded", () => {
  const matrixCanvas = document.getElementById('banner-matrix-canvas');
  const glowCanvas   = document.getElementById('banner-glow-canvas');
  
  if (matrixCanvas instanceof HTMLCanvasElement) {
    MatrixGlow.init({
      matrixCanvas, 
      glowCanvas: glowCanvas instanceof HTMLCanvasElement ? glowCanvas : undefined,
      patternSrc: '/img/matrix-pattern.jpg'
    });
  }

  const formBanner = document.querySelector("#form-banner");
  if (formBanner instanceof HTMLFormElement) {
    const registrationModals = initRegistrationModals(formBanner);
    initFormBannerValidation(formBanner, {
      onValidSubmit: registrationModals.showBySubmitResult,
    });
  }
});
