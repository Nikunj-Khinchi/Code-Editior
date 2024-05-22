
import Select from "react-select";
import monacoThemes from "monaco-themes/themes/themelist";

import PropTypes from 'prop-types';


const ThemeDropdown = ({ handleThemeChange, theme }) => {

  return (
    <Select
    className="focus:outline-none  border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2"
      placeholder={`Select Theme`}
      // options={languageOptions}
      options={Object.entries(monacoThemes).map(([themeId, themeName]) => ({
        label: themeName,
        value: themeId,
        key: themeId,
      }))}
      value={theme}
      onChange={handleThemeChange}
    />
  );
};


export default ThemeDropdown;
