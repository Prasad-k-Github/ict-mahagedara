import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const parseMarkdown = (content: string): string => {
  const html = marked(content) as string;
  return html;
};

export const highlightCode = () => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
};
