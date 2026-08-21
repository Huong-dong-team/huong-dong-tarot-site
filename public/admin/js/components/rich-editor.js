export function richEditor({ name, label, value = "" }) {
  return `<div class="field full"><span>${label}</span><div class="editor-toolbar" data-toolbar="${name}"><button type="button" data-command="bold"><strong>B</strong></button><button type="button" data-command="italic"><em>I</em></button><button type="button" data-command="formatBlock" data-value="h2">H2</button><button type="button" data-command="formatBlock" data-value="h3">H3</button><button type="button" data-command="insertUnorderedList">Danh sách</button><button type="button" data-command="createLink">Liên kết</button></div><div class="rich-editor" contenteditable="true" data-editor="${name}" role="textbox" aria-multiline="true">${value}</div><input type="hidden" name="${name}"></div>`;
}
export function bindRichEditors(root) {
  root.querySelectorAll("[data-editor]").forEach((editor) => {
    const hidden = root.querySelector(`[name="${editor.dataset.editor}"]`); hidden.value = editor.innerHTML;
    editor.addEventListener("input", () => { hidden.value = editor.innerHTML; });
  });
  root.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => {
    const editor = root.querySelector(`[data-editor="${button.closest("[data-toolbar]").dataset.toolbar}"]`); editor.focus();
    let value = button.dataset.value || null;
    if (button.dataset.command === "createLink") value = prompt("Dán liên kết https://") || "";
    document.execCommand(button.dataset.command, false, value);
    editor.dispatchEvent(new Event("input"));
  }));
}
