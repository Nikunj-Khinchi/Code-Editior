import PropTypes from "prop-types";

const UserInput = ({ customInput, setCustomInput }) => {
  return (
    <>
      {" "}
      <textarea
        rows="5"
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        placeholder={`Custom input`}
        className="focus:outline-none w-full border-2 border-black  rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white mt-2"
      ></textarea>
      
    </>
  );
};

UserInput.propTypes = {
  customInput: PropTypes.string,
  setCustomInput: PropTypes.func,
};

export default UserInput;
