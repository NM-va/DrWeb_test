import "virtual:svg-icons-register";
import "../scss/style.scss";
import { initFormBannerValidation } from "./formBannerValidation.js";
import { initRegistrationModals } from "./registrationModals.js";

document.addEventListener("DOMContentLoaded", () => {
  const formBanner = document.querySelector("#form-banner");
  if (formBanner instanceof HTMLFormElement) {
    const registrationModals = initRegistrationModals(formBanner);
    initFormBannerValidation(formBanner, {
      onValidSubmit: registrationModals.showBySubmitResult,
    });
  }
});
