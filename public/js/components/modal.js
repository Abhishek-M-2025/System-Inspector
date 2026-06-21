export function showModal({ title, body, footer, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" role="dialog">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    </div>`;

  const close = () => {
    overlay.remove();
    onClose?.();
  };

  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  return { close, overlay };
}

export function promptModal({ title, fields, onSubmit }) {
  const fieldsHtml = fields
    .map(
      (f) => `
    <div class="form-group">
      <label class="form-label" for="${f.id}">${f.label}</label>
      ${
        f.type === 'textarea'
          ? `<textarea class="form-textarea" id="${f.id}" placeholder="${f.placeholder || ''}">${f.value || ''}</textarea>`
          : `<input class="form-input" type="${f.type || 'text'}" id="${f.id}" value="${f.value || ''}" placeholder="${f.placeholder || ''}">`
      }
    </div>`
    )
    .join('');

  const footer = `
    <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
    <button class="btn btn-primary" id="modal-submit">Confirm</button>`;

  const modal = showModal({ title, body: fieldsHtml, footer });

  modal.overlay.querySelector('#modal-cancel').addEventListener('click', modal.close);
  modal.overlay.querySelector('#modal-submit').addEventListener('click', () => {
    const values = {};
    fields.forEach((f) => {
      values[f.id] = modal.overlay.querySelector(`#${f.id}`).value;
    });
    onSubmit(values, modal.close);
  });

  return modal;
}
