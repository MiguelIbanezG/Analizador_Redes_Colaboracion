declare module 'wordcloud2' {
    export interface Options {
      list: Array<[string, number]>;
      gridSize?: number;
      weightFactor?: number;
      fontFamily?: string;
      color?: string | string[] | ((word: string, weight: number, fontSize: number, distance: number) => string);
      backgroundColor?: string;
      rotateRatio?: number;
      shape?: 'circle' | 'cardioid' | 'diamond' | 'triangle' | 'triangle-forward' | 'triangle-upright' | 'pentagon' | 'star' | 'ellipse';
      ellipticity?: number;
      minSize?: number;
      maxSize?: number;
      minRotation?: number;
      maxRotation?: number;
      shuffle?: boolean;
      drawOutOfBound?: boolean;
      abortThreshold?: number;
      abort?: () => boolean;
      weight?: (word: string, weight: number) => number;
      click?: (item: { item: string; weight: number; event: MouseEvent }) => void;
      hover?: (item: { item: string; weight: number; event: MouseEvent }) => void;
    }
  
    export default function wordcloud(element: HTMLElement, options: Options): void;
  }
  