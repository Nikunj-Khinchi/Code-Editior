import PropTypes from 'prop-types';
import Select from "react-select";

import { languageOptions } from "../constants/languageOptions";

const LanguagesDropdown = ({ onSelectChange }) => {
  return (
    <Select
    className="focus:outline-none w-full border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)]  hover:shadow transition duration-200 bg-white mt-2"

      placeholder={`Filter By Category`}
      options={languageOptions}
      defaultValue={languageOptions[0]}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
    />
  );
};

LanguagesDropdown.propTypes = {
  onSelectChange: PropTypes.func.isRequired,
};


export default LanguagesDropdown;