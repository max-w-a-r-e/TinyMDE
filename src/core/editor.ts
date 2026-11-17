import { parseMarkdown } from './parser';
import { TinyMDEToolbar } from '../ui/toolbar';

export interface TinyMDEOptions {
  /**
   * CSS selector or target HTMLTextAreaElement to replace.
   */
  selector: string | HTMLTextAreaElement;

  /**
   * Whether to display the split-screen preview on initialization.
   * Defaults to true.
   */
  preview?: boolean;

  /**
   * Placeholder text when the editor is empty.
   */
  placeholder?: string;
}

/**
 * TinyMDE Editor Instance
 */
export class TinyMDEEditor {
  public originalTextarea: HTMLTextAreaElement;
  public container: HTMLElement;
  public toolbar: TinyMDEToolbar;
  public inputElement: HTMLTextAreaElement;
  public previewElement: HTMLElement;
  public previewContainer: HTMLElement;

  private isPreviewOpen: boolean;
  private originalDisplay: string;
  private boundOnInput: (e: Event) => void;

  constructor(options: TinyMDEOptions) {
    // Resolve target textarea
    if (typeof options.selector === 'string') {
      const el = document.querySelector<HTMLTextAreaElement>(options.selector);
      if (!el || el.tagName !== 'TEXTAREA') {
        throw new Error(`[TinyMDE] Element not found for selector: "${options.selector}"`);
      }
      this.originalTextarea = el;
    } else if (options.selector && options.selector.tagName === 'TEXTAREA') {
      this.originalTextarea = options.selector;
    } else {
      throw new Error('[TinyMDE] A valid selector string or HTMLTextAreaElement must be provided.');
    }

    this.isPreviewOpen = options.preview !== false;
    this.originalDisplay = this.originalTextarea.style.display;

    // Build DOM structure
    this.container = document.createElement('div');
    this.container.className = 'tinymde-container';
    if (!this.isPreviewOpen) {
      this.container.classList.add('preview-hidden');
    }

    // Toolbar
    this.toolbar = new TinyMDEToolbar({
      onInsert: (prefix, suffix, defaultText) => this.insertMarkdown(prefix, suffix, defaultText),
      onTogglePreview: () => this.togglePreview(),
      isPreviewActive: () => this.isPreviewOpen
    });
    this.container.appendChild(this.toolbar.element);

    // Body
    const body = document.createElement('div');
    body.className = 'tinymde-body';

    // Editor Pane
    const editorPane = document.createElement('div');
    editorPane.className = 'tinymde-pane tinymde-pane-editor';

    this.inputElement = document.createElement('textarea');
    this.inputElement.className = 'tinymde-input';
    this.inputElement.value = this.originalTextarea.value || '';
    if (options.placeholder) {
      this.inputElement.placeholder = options.placeholder;
    } else if (this.originalTextarea.placeholder) {
      this.inputElement.placeholder = this.originalTextarea.placeholder;
    }
    this.inputElement.spellcheck = false;
    editorPane.appendChild(this.inputElement);
    body.appendChild(editorPane);

    // Preview Pane
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'tinymde-pane tinymde-pane-preview';

    this.previewElement = document.createElement('div');
    this.previewElement.className = 'tinymde-preview';
    this.previewContainer.appendChild(this.previewElement);
    body.appendChild(this.previewContainer);

    this.container.appendChild(body);

    // Hide original textarea and insert editor in DOM
    this.originalTextarea.style.display = 'none';
    this.originalTextarea.parentNode?.insertBefore(this.container, this.originalTextarea.nextSibling);

    // Initial render
    this.updatePreview();

    // Event listeners
    this.boundOnInput = () => this.syncToOriginal();
    this.inputElement.addEventListener('input', this.boundOnInput);
  }

  /**
   * Synchronizes editor content back to the original textarea and updates preview.
   */
  private syncToOriginal(): void {
    const content = this.inputElement.value;
    if (this.originalTextarea.value !== content) {
      this.originalTextarea.value = content;
      // Dispatch events so external form handlers and validators detect changes
      this.originalTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      this.originalTextarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.updatePreview();
  }

  /**
   * Re-renders markdown into the preview pane.
   */
  private updatePreview(): void {
    if (this.isPreviewOpen) {
      this.previewElement.innerHTML = parseMarkdown(this.inputElement.value);
    }
  }

  /**
   * Inserts markdown formatting at current cursor selection.
   */
  public insertMarkdown(prefix: string, suffix = '', defaultText = ''): void {
    const input = this.inputElement;
    input.focus();

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const currentVal = input.value;

    const selectedText = currentVal.substring(start, end);
    const textToInsert = selectedText || defaultText;

    const replacement = `${prefix}${textToInsert}${suffix}`;
    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);

    input.value = `${before}${replacement}${after}`;

    // Position cursor after inserted formatting or around defaultText
    const newCursorStart = start + prefix.length;
    const newCursorEnd = newCursorStart + textToInsert.length;
    input.setSelectionRange(newCursorStart, newCursorEnd);

    this.syncToOriginal();
  }

  /**
   * Toggles the split-screen preview visibility.
   */
  public togglePreview(visible?: boolean): void {
    this.isPreviewOpen = typeof visible === 'boolean' ? visible : !this.isPreviewOpen;
    if (this.isPreviewOpen) {
      this.container.classList.remove('preview-hidden');
      this.updatePreview();
    } else {
      this.container.classList.add('preview-hidden');
    }
    this.toolbar.updatePreviewState();
  }

  /**
   * Returns current markdown text.
   */
  public getContent(): string {
    return this.inputElement.value;
  }

  /**
   * Sets editor markdown content, updating original textarea and preview.
   */
  public setContent(markdown: string): void {
    this.inputElement.value = markdown;
    this.syncToOriginal();
  }

  /**
   * Cleans up editor DOM elements and restores original textarea.
   */
  public destroy(): void {
    this.inputElement.removeEventListener('input', this.boundOnInput);
    this.toolbar.destroy();
    this.container.remove();
    this.originalTextarea.style.display = this.originalDisplay;
  }
}
