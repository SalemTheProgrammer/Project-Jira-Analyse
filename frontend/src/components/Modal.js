import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

function Modal({ showModal, setShowModal }) {
  return (
    <div>
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}
      >
        <div className="modal-dialog modal-primary">
          <div className="modal-content">
            <div className="modal-header justify-content-center">
              <div className="modal-profile">
                <i className="nc-icon nc-bulb-63 text-warning"></i>
              </div>
            </div>
            <div className="modal-body text-center">
              <p>
                {showModal && (
                  <span dangerouslySetInnerHTML={{ __html: showModal.text }} />
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary d-flex justify-content-center align-items-center"
                type="button"
                onClick={() => {
                  showModal && showModal.action();
                  setShowModal(false);
                }}
              >
                <FaCheck className="mr-2" /> {showModal && showModal.confirm}
              </button>
              <button
                className="btn btn-secondary d-flex justify-content-center align-items-center"
                type="button"
                onClick={() => setShowModal(false)}
              >
                <FaTimes className="mr-2" /> {showModal && showModal.cancel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`modal-backdrop fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
      ></div>
    </div>
  );
}

export default Modal;
