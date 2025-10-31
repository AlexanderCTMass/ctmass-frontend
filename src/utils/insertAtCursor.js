export function insertAtCursor(el, text) {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const newValue = el.value.slice(0, start) + text + el.value.slice(end);
    el.value = newValue;
    const pos = start + text.length;
    el.setSelectionRange(pos, pos);
}