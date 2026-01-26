export interface EditableElement {
  id: string;
  type: 'headline' | 'subheadline' | 'body' | 'button' | 'link';
  selector: string;
  content: string;
  styles?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  attributes?: {
    href?: string;
    target?: string;
  };
}

export interface PageState {
  elements: EditableElement[];
  history: EditableElement[][];
  currentIndex: number;
}

export const savePageState = (state: PageState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pageEditorState', JSON.stringify(state));
  }
};

export const loadPageState = (): PageState | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('pageEditorState');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return null;
};

export const applyElementChanges = (element: EditableElement): void => {
  const domElement = document.querySelector(element.selector);
  if (!domElement) return;

  // Update content
  if (element.type === 'button' || element.type === 'link') {
    domElement.textContent = element.content;
  } else {
    domElement.textContent = element.content;
  }

  // Update styles
  if (element.styles) {
    Object.entries(element.styles).forEach(([key, value]) => {
      if (value && domElement instanceof HTMLElement) {
        domElement.style[key as any] = value;
      }
    });
  }

  // Update attributes
  if (element.attributes) {
    Object.entries(element.attributes).forEach(([key, value]) => {
      if (value) {
        domElement.setAttribute(key, value);
      }
    });
  }
};

export const extractElementData = (element: HTMLElement, type: EditableElement['type']): EditableElement => {
  const selector = getUniqueSelector(element);
  
  return {
    id: generateId(),
    type,
    selector,
    content: element.textContent || '',
    styles: {
      color: element.style.color || window.getComputedStyle(element).color,
      backgroundColor: element.style.backgroundColor || window.getComputedStyle(element).backgroundColor,
      fontSize: element.style.fontSize || window.getComputedStyle(element).fontSize,
      fontWeight: element.style.fontWeight || window.getComputedStyle(element).fontWeight,
    },
    attributes: {
      href: element.getAttribute('href') || undefined,
      target: element.getAttribute('target') || undefined,
    },
  };
};

const getUniqueSelector = (element: HTMLElement): string => {
  if (element.id) {
    return `#${element.id}`;
  }

  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className) {
      const classes = current.className.split(' ').filter(c => c && !c.startsWith('editable-'));
      if (classes.length > 0) {
        selector += `.${classes[0]}`;
      }
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current);
        selector += `:nth-of-type(${index + 1})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
};

const generateId = (): string => {
  return `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const rgbToHex = (rgb: string): string => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;

  const hex = (x: string) => {
    const n = parseInt(x, 10);
    return ('0' + n.toString(16)).slice(-2);
  };

  return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
};

