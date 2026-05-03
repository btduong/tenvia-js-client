declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// NO need to include 'export default src' because side-effect imports don't use it
declare module '*.css';

declare module '*.mp3' {
  const src: string;
  export default src;
}