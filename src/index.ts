import './ui/styles.css';
import { TinyMDEEditor, TinyMDEOptions } from './core/editor';
import { parseMarkdown, parseInline, escapeHtml } from './core/parser';

/**
 * Public TinyMDE API
 */
export const TinyMDE = {
  /**
   * Initializes TinyMDE on a target textarea element.
   */
  init(options: TinyMDEOptions): TinyMDEEditor {
    return new TinyMDEEditor(options);
  },

  /**
   * Directly parses markdown to HTML without instantiating an editor.
   */
  parseMarkdown,
  parseInline,
  escapeHtml
};

export default TinyMDE;
export { TinyMDEEditor, type TinyMDEOptions, parseMarkdown, parseInline, escapeHtml };
