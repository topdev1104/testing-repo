import React from "react";
import xMark from "./xMark.svg";
import withdrawIcon from "./withdrawIcon.svg";
import statsIcon from "./statsIcon.svg";
import calculatorIcon from "../calculator/assets/calculator.svg";


const Modal = ({ visible, modalId, setIsVisible, children, title, width, maxHeight }) => {
  let className = "modal fade ";
  let style = {};
  if (visible === true) {
    className = "modal fade show";
    style = { display: "block", background: "rgba(0,0,0, 0.5)" };
  }

  const closeModal = () => {
    setIsVisible(false);
  };
  

  return (
    <div
      className={className}
      id={modalId}
      tabIndex="-1"
      aria-labelledby={"modalLabel" + modalId}
      aria-hidden="true"
      style={style}
    >
      <div className="modal-dialog tymodal">
        <div
          className="modal-content"
          style={{ width: title === "withdraw" ? "fit-content" : width, maxHeight: maxHeight }}
        >
          <div className="modal-header justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              {title === "stats" ||
                title !== "withdraw" ||
                (title !== "proposal" && (
                  <img
                    src={title === "stats" ? statsIcon : title === "withdraw" ? withdrawIcon : title === "calculator" ? calculatorIcon : null}
                    height={25}
                    width={25}
                    alt=""
                  />
                ))}
              <h6
                style={{
                  fontWeight: "500",
                  fontSize: "20px",
                  lineHeight: "28px",
                  color: "#f7f7fc",
                }}
              >
                {title === "stats"
                  ? "My Stats"
                  : title === "proposal"
                  ? "New proposal"
                  : title === "withdraw"
                  ? "Withdraw"
                  : title === "calculator" ?
                    "Calculator" : 
                    ""}
              </h6>
            </div>
            <img
              src={xMark}
              style={{ cursor: "pointer" }}
              onClick={closeModal}
            />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

Modal.defaultProps = {
  setIsVisible: () => {},
};

export default Modal;
