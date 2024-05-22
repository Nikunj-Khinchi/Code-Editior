import PropTypes from 'prop-types';
import Editor from "@monaco-editor/react";
import { useState } from 'react';

const CodeEditor = ({ onChange, language, code, theme ,vh , access }) => {
  const [value, setValue] = useState(code || "");
  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value);
  };

  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
      <Editor
        height={ vh || "80vh"}
        width={`100%`}
        language={language || "javascript"}
        value={value}
        theme={theme}
        defaultValue="// some comment"
        onChange={handleEditorChange}
        options={{ readOnly: access || false }}
        
      />
    </div>
  );
};

CodeEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  language: PropTypes.string,
  code: PropTypes.string,
  theme: PropTypes.string,
  vh : PropTypes.string,
  access: PropTypes.bool
};

export default CodeEditor;