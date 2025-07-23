import React from "react";
import ReactDOM from 'react-dom';
import './InfoAlertModal.css';

const InfoAlertModal = ({isOpen, onClose, title, message}) =>{
    if(!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="alert-modal-overlay" onClick={onClose}>
            <div className="alert-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="alert-modal-header">
                    <h2 className="alert-modal-title">{title}</h2>
                    <div className="alert-close-button" onClick={onClose}>&times;</div>
                </div>
                <div className="alert-modal-content">
                    {message}
                </div>
            </div>
        </div>,
        document.body // body 태그에 렌더링
    );
};

export default InfoAlertModal;