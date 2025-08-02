declare module 'react-katex' {
  import { ComponentType } from 'react';

  interface MathProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => JSX.Element;
    settings?: any;
  }

  export const InlineMath: ComponentType<MathProps>;
  export const BlockMath: ComponentType<MathProps>;
}