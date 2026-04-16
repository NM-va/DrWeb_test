const MSG_REQUIRED = "Укажите данные";
const MSG_EMAIL_INVALID = "Укажите корректный e-mail";

/**
 * @param {HTMLFormElement} form
 * @param {{ onValidSubmit?: (payload: { email: string }) => void }} [options]
 */
export function initFormBannerValidation(form, options = {}) {
  const onValidSubmit = typeof options.onValidSubmit === "function" ? options.onValidSubmit : () => {};
  const fieldIds = /** @type {const} */ ([
    "form-banner-name",
    "form-banner-company",
    "form-banner-job",
    "form-banner-email",
    "form-banner-phone",
  ]);

  const submitBtn = form.querySelector(".form-banner__submit");
  const consent = form.querySelector("#form-banner-consent");
  const emailAlert = form.querySelector("#form-banner-email-alert");

  if (!(submitBtn instanceof HTMLButtonElement) || !(consent instanceof HTMLInputElement)) {
    return;
  }

  /** Показывать тексты ошибок после первой попытки отправки */
  let submitAttempted = false;

  /** @param {string} id */
  function errorEl(id) {
    const el = form.querySelector(`#${id}-error`);
    return el instanceof HTMLElement ? el : null;
  }

  /** @param {HTMLInputElement} input @param {boolean} invalid @param {string} [message] */
  function setFieldError(input, invalid, message = MSG_REQUIRED) {
    const wrap = input.closest(".form-banner__field");
    const err = errorEl(input.id);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (wrap) {
      wrap.classList.toggle("form-banner__field--error", invalid);
    }
    input.classList.toggle("form-banner__input--error", invalid);
    if (err) {
      const show = submitAttempted && invalid;
      err.textContent = show ? message : "";
      err.hidden = !show;
    }
  }

  function emailValid(value) {
    const v = value.trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  /** @param {HTMLInputElement} input */
  function validateField(input) {
    if (!submitAttempted) {
      return input.name === "email" ? emailValid(input.value) : input.value.trim().length > 0;
    }
    if (input.name === "email") {
      const v = input.value.trim();
      if (!v) {
        setFieldError(input, true, MSG_REQUIRED);
        return false;
      }
      if (!emailValid(v)) {
        setFieldError(input, true, MSG_EMAIL_INVALID);
        return false;
      }
      setFieldError(input, false);
      return true;
    }
    if (!input.value.trim()) {
      setFieldError(input, true);
      return false;
    }
    setFieldError(input, false);
    return true;
  }

  function validateConsent() {
    const wrap = consent.closest(".form-banner__field");
    const err = form.querySelector("#form-banner-consent-error");
    const ok = consent.checked;
    const showErr = submitAttempted && !ok;
    if (wrap) wrap.classList.toggle("form-banner__field--error", showErr);
    consent.classList.toggle("form-banner__checkbox--error", showErr);
    if (err instanceof HTMLElement) {
      err.textContent = showErr ? MSG_REQUIRED : "";
      err.hidden = !showErr;
    }
    consent.setAttribute("aria-invalid", showErr ? "true" : "false");
    return ok;
  }

  function isFormValid() {
    const inputsOk = fieldIds.every((id) => {
      const input = form.querySelector(`#${id}`);
      if (!(input instanceof HTMLInputElement)) return false;
      if (input.name === "email") return emailValid(input.value);
      return input.value.trim().length > 0;
    });
    return inputsOk && consent.checked;
  }

  function getSubmitPayload() {
    const emailInput = form.querySelector("#form-banner-email");
    return {
      email: emailInput instanceof HTMLInputElement ? emailInput.value : "",
    };
  }

  function updateSubmitState() {
    submitBtn.disabled = !isFormValid();
  }

  fieldIds.forEach((id) => {
    const input = form.querySelector(`#${id}`);
    if (!(input instanceof HTMLInputElement)) return;

    input.addEventListener("input", () => {
      if (submitAttempted) validateField(input);
      updateSubmitState();
    });

    input.addEventListener("blur", () => {
      if (submitAttempted) validateField(input);
      updateSubmitState();
    });
  });

  const emailInput = form.querySelector("#form-banner-email");
  if (emailInput instanceof HTMLInputElement && emailAlert instanceof HTMLElement) {
    const showAlert = () => {
      emailAlert.hidden = false;
    };
    const hideAlert = () => {
      emailAlert.hidden = true;
    };

    emailInput.addEventListener("focus", showAlert);
    emailInput.addEventListener("input", showAlert);
    emailInput.addEventListener("blur", hideAlert);
  }

  consent.addEventListener("change", () => {
    if (submitAttempted) validateConsent();
    updateSubmitState();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitAttempted = true;
    let ok = true;
    fieldIds.forEach((id) => {
      const input = form.querySelector(`#${id}`);
      if (!(input instanceof HTMLInputElement)) return;
      if (!validateField(input)) ok = false;
    });
    if (!validateConsent()) ok = false;
    updateSubmitState();
    if (ok) {
      onValidSubmit(getSubmitPayload());
    }
  });

  updateSubmitState();
}
