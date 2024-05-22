import PropTypes from 'prop-types';


const OutputDetails = ({ outputDetails }) => {
    console.log(outputDetails);
    return (
        <div className="metrics-container mt-4 flex flex-col space-y-3">
          <p className="text-sm">
            Status:{" "}
            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
              {outputDetails?.status?.description}
            </span>
          </p>
          <p className="text-sm">
            Memory:{" "}
            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
              {outputDetails?.memory}
            </span>
          </p>
          <p className="text-sm">
            Time:{" "}
            <span className="font-semibold px-2 py-1 rounded-md bg-gray-100">
              {outputDetails?.time}
            </span>
          </p>
        </div>
        // <div>helo</div>
    );
};

OutputDetails.propTypes = {
    outputDetails: PropTypes.object.isRequired,
};

export default OutputDetails;
