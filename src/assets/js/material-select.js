/**
 * Accessible Material Design select — hides native browser dropdown UI
 * while keeping the native <select> for form submission and validation.
 */
(function () {
  const SELECTOR = "select:not([data-md-select-init]):not(.md-select-native)";

  function getSelectedOption(select) {
    return select.options[select.selectedIndex] || null;
  }

  function getDisplayText(select) {
    const option = getSelectedOption(select);
    if (!option) return "";
    if (option.value === "" && option.text) return option.text;
    return option.text;
  }

  function buildOptions(select, listbox, trigger, wrapper) {
    listbox.innerHTML = "";
    const options = Array.from(select.options);

    options.forEach((option, index) => {
      if (option.disabled) return;

      const item = document.createElement("li");
      item.className = "md-select-option";
      item.setAttribute("role", "option");
      item.setAttribute("data-value", option.value);
      item.setAttribute("data-index", String(index));
      item.id = `${select.id || "select"}-option-${index}`;
      item.tabIndex = -1;

      const isSelected = option.selected;
      item.setAttribute("aria-selected", isSelected ? "true" : "false");
      if (isSelected) item.classList.add("is-selected");

      item.innerHTML = `<span class="md-select-option-text">${option.text}</span><span class="md-select-option-check" aria-hidden="true"><i class="fas fa-check"></i></span>`;
      listbox.appendChild(item);
    });

    updateTriggerText(select, trigger);
    syncActiveOption(listbox, select.selectedIndex);
  }

  function updateTriggerText(select, trigger) {
    const valueEl = trigger.querySelector(".md-select-value");
    if (!valueEl) return;
    valueEl.textContent = getDisplayText(select);
    trigger.classList.toggle("md-select-trigger--placeholder", select.value === "");
  }

  function syncActiveOption(listbox, selectedIndex) {
    const items = listbox.querySelectorAll(".md-select-option");
    items.forEach((item) => {
      const index = Number(item.getAttribute("data-index"));
      const isSelected = index === selectedIndex;
      item.setAttribute("aria-selected", isSelected ? "true" : "false");
      item.classList.toggle("is-selected", isSelected);
      item.classList.toggle("is-active", isSelected);
    });
  }

  function setActiveByIndex(listbox, index) {
    const items = listbox.querySelectorAll(".md-select-option");
    items.forEach((item) => item.classList.remove("is-active"));
    const target = listbox.querySelector(`.md-select-option[data-index="${index}"]`);
    if (target) {
      target.classList.add("is-active");
      target.scrollIntoView({ block: "nearest" });
    }
    return target;
  }

  function getActiveIndex(listbox) {
    const active = listbox.querySelector(".md-select-option.is-active");
    return active ? Number(active.getAttribute("data-index")) : -1;
  }

  function getEnabledIndices(select) {
    return Array.from(select.options)
      .map((opt, i) => (opt.disabled ? -1 : i))
      .filter((i) => i >= 0);
  }

  function openSelect(wrapper, trigger, listbox, select) {
    if (select.disabled) return;
    wrapper.classList.add("md-select--open");
    trigger.setAttribute("aria-expanded", "true");
    listbox.removeAttribute("hidden");
    setActiveByIndex(listbox, select.selectedIndex);
  }

  function closeSelect(wrapper, trigger, listbox) {
    wrapper.classList.remove("md-select--open");
    trigger.setAttribute("aria-expanded", "false");
    listbox.setAttribute("hidden", "");
    listbox.querySelectorAll(".md-select-option.is-active").forEach((item) => {
      item.classList.remove("is-active");
    });
  }

  function selectOption(select, index, trigger, listbox, wrapper) {
    if (index < 0 || index >= select.options.length) return;
    const option = select.options[index];
    if (option.disabled) return;

    select.selectedIndex = index;
    syncActiveOption(listbox, index);
    updateTriggerText(select, trigger);
    select.dispatchEvent(new Event("change", { bubbles: true }));
    select.dispatchEvent(new Event("input", { bubbles: true }));
    closeSelect(wrapper, trigger, listbox);
    trigger.focus();
  }

  function initMaterialSelect(select) {
    if (!select || select.dataset.mdSelectInit === "true") return;
    select.dataset.mdSelectInit = "true";

    const wrapper = document.createElement("div");
    wrapper.className = "md-select";
    if (select.disabled) wrapper.classList.add("md-select--disabled");
    if (select.required) wrapper.classList.add("md-select--required");

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    select.classList.add("md-select-native");
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "md-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");

    const selectId = select.id || `md-select-${Math.random().toString(36).slice(2, 9)}`;
    if (!select.id) select.id = selectId;

    const listboxId = `${selectId}-listbox`;
    trigger.id = `${selectId}-trigger`;
    trigger.setAttribute("aria-controls", listboxId);
    trigger.setAttribute("aria-expanded", "false");

    const label = select.id
      ? document.querySelector(`label[for="${CSS.escape(select.id)}"]`)
      : null;
    if (label) {
      if (!label.id) label.id = `${selectId}-label`;
      trigger.setAttribute("aria-labelledby", label.id);
    } else if (select.getAttribute("aria-label")) {
      trigger.setAttribute("aria-label", select.getAttribute("aria-label"));
    }

    trigger.innerHTML =
      '<span class="md-select-value"></span><span class="md-select-icon" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>';

    const menu = document.createElement("div");
    menu.className = "md-select-menu";

    const listbox = document.createElement("ul");
    listbox.className = "md-select-listbox";
    listbox.id = listboxId;
    listbox.setAttribute("role", "listbox");
    listbox.setAttribute("hidden", "");

    menu.appendChild(listbox);
    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    buildOptions(select, listbox, trigger, wrapper);

    trigger.addEventListener("click", () => {
      if (wrapper.classList.contains("md-select--open")) {
        closeSelect(wrapper, trigger, listbox);
      } else {
        openSelect(wrapper, trigger, listbox, select);
      }
    });

    trigger.addEventListener("keydown", (e) => {
      const enabled = getEnabledIndices(select);
      if (!enabled.length) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
      }

      if (!wrapper.classList.contains("md-select--open")) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
          openSelect(wrapper, trigger, listbox, select);
        }
        return;
      }

      let activeIndex = getActiveIndex(listbox);
      if (activeIndex < 0) activeIndex = select.selectedIndex;

      const currentPos = enabled.indexOf(activeIndex);

      if (e.key === "Escape") {
        closeSelect(wrapper, trigger, listbox);
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        selectOption(select, activeIndex, trigger, listbox, wrapper);
        return;
      }

      if (e.key === "ArrowDown") {
        const next = enabled[Math.min(currentPos + 1, enabled.length - 1)] ?? enabled[0];
        setActiveByIndex(listbox, next);
        return;
      }

      if (e.key === "ArrowUp") {
        const prev = enabled[Math.max(currentPos - 1, 0)] ?? enabled[enabled.length - 1];
        setActiveByIndex(listbox, prev);
        return;
      }

      if (e.key === "Home") {
        setActiveByIndex(listbox, enabled[0]);
        return;
      }

      if (e.key === "End") {
        setActiveByIndex(listbox, enabled[enabled.length - 1]);
      }
    });

    listbox.addEventListener("click", (e) => {
      const option = e.target.closest(".md-select-option");
      if (!option) return;
      selectOption(select, Number(option.getAttribute("data-index")), trigger, listbox, wrapper);
    });

    listbox.addEventListener("keydown", (e) => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", e));
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        closeSelect(wrapper, trigger, listbox);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && wrapper.classList.contains("md-select--open")) {
        closeSelect(wrapper, trigger, listbox);
        trigger.focus();
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (wrapper.classList.contains("md-select--open")) {
          closeSelect(wrapper, trigger, listbox);
        }
      },
      true
    );

    select.addEventListener("change", () => {
      buildOptions(select, listbox, trigger, wrapper);
    });

    const form = select.closest("form");
    if (form) {
      form.addEventListener(
        "invalid",
        (e) => {
          if (e.target === select) {
            wrapper.classList.add("md-select--invalid");
            trigger.focus();
          }
        },
        true
      );
      const clearInvalid = () => {
        if (select.checkValidity()) wrapper.classList.remove("md-select--invalid");
      };
      form.addEventListener("input", clearInvalid);
      select.addEventListener("change", clearInvalid);
    }

    const observer = new MutationObserver(() => {
      buildOptions(select, listbox, trigger, wrapper);
    });
    observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });

    if (select.disabled) {
      trigger.disabled = true;
    }
  }

  function initMaterialSelects(root = document) {
    root.querySelectorAll(SELECTOR).forEach(initMaterialSelect);
  }

  window.initMaterialSelects = initMaterialSelects;
  window.initMaterialSelect = initMaterialSelect;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initMaterialSelects());
  } else {
    initMaterialSelects();
  }

  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.(SELECTOR)) initMaterialSelect(node);
        node.querySelectorAll?.(SELECTOR).forEach(initMaterialSelect);
      });
    });
  });

  domObserver.observe(document.documentElement, { childList: true, subtree: true });
})();
