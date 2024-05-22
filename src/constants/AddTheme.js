import { loader } from "@monaco-editor/react";
import themes from "./ImportThemes"

const defineTheme = (theme) => {
  return new Promise((res) => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme(theme, themes[theme]);
      res();
    });
  });
};

export { defineTheme };
