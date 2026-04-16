const MODAL_IDS = {
  success: "modal-success",
  error: "modal-error",
  registeredEmail: "modal-registered-email",
};

/**
 * @param {{ email: string }} payload
 */
function getModalType(payload) {
  const email = payload.email.trim().toLowerCase();
  if (email.includes("error")) return "error";
  if (email.includes("exist") || email.includes("duplicate")) return "registeredEmail";
  return "success";
}

/**
 * @param {HTMLFormElement} form
 */
export function initRegistrationModals(form) {
  const modals = {
    success: document.getElementById(MODAL_IDS.success),
    error: document.getElementById(MODAL_IDS.error),
    registeredEmail: document.getElementById(MODAL_IDS.registeredEmail),
  };

  /** @type {HTMLElement | null} */
  let activeModal = null;

  const emailInput = form.querySelector("#form-banner-email");
  const closeButtons = document.querySelectorAll("[data-modal-close]");

  function closeModal() {
    if (!activeModal) return;
    activeModal.hidden = true;
    document.body.style.overflow = "";
    activeModal = null;
  }

  /**
   * @param {"success" | "error" | "registeredEmail"} type
   */
  function openModal(type) {
    Object.values(modals).forEach((modal) => {
      if (modal instanceof HTMLElement) {
        modal.hidden = true;
      }
    });

    const target = modals[type];
    if (!(target instanceof HTMLElement)) return;
    target.hidden = false;
    document.body.style.overflow = "hidden";
    activeModal = target;
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      if (target.dataset.modalAction === "focus-email" && emailInput instanceof HTMLInputElement) {
        emailInput.focus();
      }
      closeModal();
    });
  });

  Object.values(modals).forEach((modal) => {
    if (!(modal instanceof HTMLElement)) return;
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  /**
   * @param {{ email: string }} payload
   */
  function showBySubmitResult(payload) {
    openModal(getModalType(payload));
  }

  return {
    showBySubmitResult,
  };
}
