/* Interactive documentation specimens only; production contracts live on each page. */
(function () {
  'use strict';
  document.querySelectorAll('[data-indeterminate="true"]').forEach(function (input) {
    if (input instanceof HTMLInputElement) input.indeterminate = true;
  });
  document.querySelectorAll('.ds-demo form').forEach(function (form) {
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  });
  document.addEventListener('click', async function (event) {
    var control = event.target.closest('button, a');
    if (!control) return;
    if (control.getAttribute('aria-disabled') === 'true' || control.getAttribute('aria-busy') === 'true') {
      event.preventDefault();
      return;
    }
    if (control.hasAttribute('data-open-dialog')) {
      var dialog = document.getElementById(control.dataset.openDialog);
      dialog.showModal();
      var safe = dialog.querySelector('[data-close-dialog]');
      if (safe) safe.focus();
    }
    if (control.hasAttribute('data-close-dialog')) control.closest('dialog').close();
    if (control.hasAttribute('data-dismiss-demo')) {
      var message = control.closest('.toast, .alert');
      if (message) message.hidden = true;
    }
    if (control.hasAttribute('data-remove-demo')) control.closest('.pill').hidden = true;
    if (control.classList.contains('chip') && control.hasAttribute('aria-pressed')) {
      control.setAttribute('aria-pressed', control.getAttribute('aria-pressed') !== 'true');
    }
    if (control.matches('[role="tab"]')) activateTab(control);
    if (control.hasAttribute('data-sort-demo')) {
      var heading = control.closest('th');
      heading.setAttribute('aria-sort', heading.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending');
    }
    if (control.hasAttribute('data-password-toggle')) {
      var password = control.closest('.input-group').querySelector('input');
      password.type = password.type === 'password' ? 'text' : 'password';
      control.textContent = password.type === 'password' ? 'Show password' : 'Hide password';
    }
    if (control.hasAttribute('data-copy-demo')) {
      var block = control.parentElement;
      var status = block.querySelector('[role="status"]');
      try {
        await navigator.clipboard.writeText(block.querySelector('code').textContent);
        status.textContent = 'Code copied.';
      } catch (error) {
        status.textContent = 'Copy is unavailable. Select the code and copy it manually.';
      }
    }
  });
  function activateTab(tab) {
    var group = tab.closest('[data-demo-tabs]');
    group.querySelectorAll('[role="tab"]').forEach(function (item) {
      var active = item === tab;
      item.setAttribute('aria-selected', active);
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      document.querySelectorAll('.tooltip-anchor').forEach(function (anchor) { anchor.dataset.dismissed = 'true'; });
    }
    var tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    var tabs = Array.from(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]:not(:disabled)'));
    var index = tabs.indexOf(tab);
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[index].focus();
  });
  document.addEventListener('focusin', function (event) {
    var anchor = event.target.closest('.tooltip-anchor');
    if (anchor) delete anchor.dataset.dismissed;
  });
  document.addEventListener('pointerover', function (event) {
    var anchor = event.target.closest('.tooltip-anchor');
    if (anchor) delete anchor.dataset.dismissed;
  });
  document.addEventListener('input', function (event) {
    if (!event.target.matches('input[type="range"], input[type="number"]')) return;
    var group = event.target.closest('.field');
    if (!group || !group.querySelector('input[type="range"]')) return;
    group.querySelectorAll('input').forEach(function (input) { input.value = event.target.value; });
    var output = group.querySelector('output');
    if (output) output.textContent = 'Within ' + event.target.value + ' km';
  });
})();
