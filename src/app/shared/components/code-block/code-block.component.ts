import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { RippleDirective } from '../ripple/ripple.directive';
import { TooltipDirective } from '../tooltip/tooltip.directive';

export interface CodeFile {
  name: string;
  language?: string;
  code: string;
  highlightLines?: number[];
}

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CommonModule, IconComponent, RippleDirective, TooltipDirective],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.css'
})
export class CodeBlockComponent {
  @Input() code: string = '';
  @Input() language: string = 'typescript';
  @Input() fileName: string = '';
  @Input() files: CodeFile[] = [];
  @Input() showLineNumbers: boolean = true;
  @Input() highlightLines: number[] = [];
  @Input() showCopyButton: boolean = true;
  @Input() collapsible: boolean = false;
  @Input() maxHeight: string = '420px';
  @Input() set wrapLines(val: boolean) {
    this.isWrapped.set(val);
  }

  readonly activeIndex = signal<number>(0);
  readonly copied = signal<boolean>(false);
  readonly isWrapped = signal<boolean>(false);
  readonly isCollapsed = signal<boolean>(false);

  readonly currentFile = computed(() => {
    if (this.files && this.files.length > 0) {
      const idx = Math.min(this.activeIndex(), this.files.length - 1);
      return this.files[idx];
    }
    return {
      name: this.fileName,
      language: this.language,
      code: this.code,
      highlightLines: this.highlightLines
    };
  });

  readonly currentCode = computed(() => this.currentFile().code || '');
  readonly currentLanguage = computed(() => (this.currentFile().language || this.language || 'code').toLowerCase());
  readonly currentFileName = computed(() => this.currentFile().name || this.fileName);
  readonly activeHighlightLines = computed(() => this.currentFile().highlightLines || this.highlightLines || []);

  readonly lineList = computed(() => {
    const rawCode = this.currentCode();
    if (!rawCode) return [];
    const lines = rawCode.split('\n');
    const highlights = new Set(this.activeHighlightLines());

    return lines.map((lineText, index) => {
      const lineNum = index + 1;
      return {
        number: lineNum,
        text: lineText,
        html: this.highlightLineSyntax(lineText, this.currentLanguage()),
        isHighlighted: highlights.has(lineNum)
      };
    });
  });

  selectTab(index: number): void {
    this.activeIndex.set(index);
  }

  toggleWrap(): void {
    this.isWrapped.update(w => !w);
  }

  toggleCollapse(): void {
    this.isCollapsed.update(c => !c);
  }

  copyCode(): void {
    const textToCopy = this.currentCode();
    if (!textToCopy) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        this.triggerCopiedState();
      }).catch(() => {
        this.fallbackCopyText(textToCopy);
      });
    } else {
      this.fallbackCopyText(textToCopy);
    }
  }

  private fallbackCopyText(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.triggerCopiedState();
    } catch {
      // Fail silently
    }
    document.body.removeChild(textarea);
  }

  private triggerCopiedState(): void {
    this.copied.set(true);
    setTimeout(() => {
      this.copied.set(false);
    }, 2000);
  }

  private highlightLineSyntax(line: string, lang: string): string {
    if (!line) return '&nbsp;';

    const escapeHtml = (str: string) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return `<span class="tok-comment">${escapeHtml(line)}</span>`;
    }

    if (lang === 'html' || lang === 'xml') {
      let escaped = escapeHtml(line);
      escaped = escaped
        .replace(/(&lt;\/?[\w-]+)/g, '<span class="tok-tag">$1</span>')
        .replace(/([\w-]+)=(&quot;|')[^&]*(&quot;|')/g, '<span class="tok-attr">$1</span>=<span class="tok-string">$2</span>');
      return escaped;
    }

    const keywords = new Set([
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'class', 'interface', 'type', 'public', 'private',
      'protected', 'readonly', 'async', 'await', 'new', 'this', 'extends', 'implements',
      'switch', 'case', 'default', 'try', 'catch', 'throw', 'typeof', 'instanceof',
      'true', 'false', 'null', 'undefined', 'boolean', 'string', 'number', 'void', 'signal', 'computed'
    ]);

    const tokens: Array<{ text: string; type: string }> = [];
    let i = 0;
    const len = line.length;

    while (i < len) {
      if (line[i] === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.substring(i), type: 'comment' });
        break;
      }

      if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i];
        let j = i + 1;
        while (j < len && (line[j] !== quote || line[j - 1] === '\\')) {
          j++;
        }
        if (j < len) j++;
        tokens.push({ text: line.substring(i, j), type: 'string' });
        i = j;
        continue;
      }

      if (line[i] === '@' && /[a-zA-Z_]/.test(line[i + 1] || '')) {
        let j = i + 1;
        while (j < len && /[a-zA-Z0-9_]/.test(line[j])) j++;
        tokens.push({ text: line.substring(i, j), type: 'decorator' });
        i = j;
        continue;
      }

      if (/[a-zA-Z_$]/.test(line[i])) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_$]/.test(line[j])) j++;
        const word = line.substring(i, j);

        let k = j;
        while (k < len && /\s/.test(line[k])) k++;
        const isFunctionCall = line[k] === '(';

        if (keywords.has(word)) {
          tokens.push({ text: word, type: 'keyword' });
        } else if (isFunctionCall) {
          tokens.push({ text: word, type: 'function' });
        } else {
          tokens.push({ text: word, type: 'plain' });
        }

        i = j;
        continue;
      }

      if (/[0-9]/.test(line[i])) {
        let j = i;
        while (j < len && /[0-9.]/.test(line[j])) j++;
        tokens.push({ text: line.substring(i, j), type: 'number' });
        i = j;
        continue;
      }

      tokens.push({ text: line[i], type: 'plain' });
      i++;
    }

    return tokens.map(t => {
      const safeText = escapeHtml(t.text);
      switch (t.type) {
        case 'keyword': return `<span class="tok-keyword">${safeText}</span>`;
        case 'string': return `<span class="tok-string">${safeText}</span>`;
        case 'comment': return `<span class="tok-comment">${safeText}</span>`;
        case 'number': return `<span class="tok-number">${safeText}</span>`;
        case 'function': return `<span class="tok-function">${safeText}</span>`;
        case 'decorator': return `<span class="tok-decorator">${safeText}</span>`;
        default: return safeText;
      }
    }).join('');
  }
}
