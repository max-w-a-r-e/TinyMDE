export interface ToolbarAction {
  id: string;
  label: string;
  title: string;
  icon?: string;
  action: () => void;
}

export interface ToolbarOptions {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  onTogglePreview: () => void;
  isPreviewActive: () => boolean;
}

/**
 * Creates and manages the TinyMDE toolbar.
 */
export class TinyMDEToolbar {
  public element: HTMLElement;
  private previewBtn: HTMLButtonElement | null = null;
  private options: ToolbarOptions;

  constructor(options: ToolbarOptions) {
    this.options = options;
    this.element = document.createElement('div');
    this.element.className = 'tinymde-toolbar';
    this.element.setAttribute('role', 'toolbar');
    this.element.setAttribute('aria-label', 'Markdown formatting tools');
    this.render();
  }

  private render(): void {
    const items: Array<{
      id: string;
      label: string;
      title: string;
      onClick: () => void;
      isToggle?: boolean;
    }> = [
      {
        id: 'h1',
        label: 'H1',
        title: 'Heading 1 (#)',
        onClick: () => this.options.onInsert('# ', '', 'Heading 1')
      },
      {
        id: 'h2',
        label: 'H2',
        title: 'Heading 2 (##)',
        onClick: () => this.options.onInsert('## ', '', 'Heading 2')
      },
      {
        id: 'h3',
        label: 'H3',
        title: 'Heading 3 (###)',
        onClick: () => this.options.onInsert('### ', '', 'Heading 3')
      },
      {
        id: 'bold',
        label: 'B',
        title: 'Bold (**text**)',
        onClick: () => this.options.onInsert('**', '**', 'bold text')
      },
      {
        id: 'italic',
        label: 'I',
        title: 'Italic (*text*)',
        onClick: () => this.options.onInsert('*', '*', 'italic text')
      },
      {
        id: 'code',
        label: '< >',
        title: 'Inline Code (`code`)',
        onClick: () => this.options.onInsert('`', '`', 'code')
      },
      {
        id: 'codeblock',
        label: '```',
        title: 'Code Block (```)',
        onClick: () => this.options.onInsert('```\n', '\n```', 'code block')
      },
      {
        id: 'link',
        label: '🔗',
        title: 'Insert Link ([text](url))',
        onClick: () => this.options.onInsert('[', '](https://)', 'link text')
      },
      {
        id: 'ul',
        label: '• List',
        title: 'Unordered List (- item)',
        onClick: () => this.options.onInsert('- ', '', 'List item')
      },
      {
        id: 'ol',
        label: '1. List',
        title: 'Ordered List (1. item)',
        onClick: () => this.options.onInsert('1. ', '', 'Numbered item')
      },
      {
        id: 'preview',
        label: '👁 Preview',
        title: 'Toggle Split-Screen Preview',
        onClick: () => {
          this.options.onTogglePreview();
          this.updatePreviewState();
        },
        isToggle: true
      }
    ];

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tinymde-btn tinymde-btn-${item.id}`;
      btn.textContent = item.label;
      btn.title = item.title;
      btn.setAttribute('aria-label', item.title);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        item.onClick();
      });

      if (item.isToggle) {
        this.previewBtn = btn;
        if (this.options.isPreviewActive()) {
          btn.classList.add('active');
        }
      }

      this.element.appendChild(btn);
    });
  }

  public updatePreviewState(): void {
    if (this.previewBtn) {
      if (this.options.isPreviewActive()) {
        this.previewBtn.classList.add('active');
      } else {
        this.previewBtn.classList.remove('active');
      }
    }
  }

  public destroy(): void {
    this.element.remove();
  }
}
