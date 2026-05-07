declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// NO need to include 'export default src' because side-effect imports ie import ./index.css don't use it
declare module '*.css';

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}