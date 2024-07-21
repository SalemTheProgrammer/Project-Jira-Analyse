import React from "react";

const Spinner = ({ msg }) => {
  return (
    <div className="row justify-content-center mt-3">
      <div className="col-auto d-flex align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden"></span>
        </div>
        <div className="ms-3" dangerouslySetInnerHTML={{ __html: msg }}></div>
      </div>
    </div>
  );
};

export default Spinner;
