import React from 'react';
import './AdditionalInfoModal.css';

const AdditionalInfoModal = ({
    isOpen,
    onClose,
    onSubmit,
    openDate,
    setOpenDate,
    ceoName,
    setCeoName,
}) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!openDate || openDate.trim().length !== 8 || !ceoName || ceoName.trim().length === 0) {
            alert("개업일자 (8자리) 와 대표자명을 모두 입력해주세요.");
            return;
        }
        onSubmit({ openDate, ceoName });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>개업일자 및 대표자명 입력</h3>

                <div className="form-group">
                    <label htmlFor="modal-open-date" className="form-label">개업일자</label>
                    <input
                        type="text"
                        id="modal-open-date"
                        className="form-input"
                        value={openDate}
                        onChange={(e) => setOpenDate(e.target.value.replace(/[^0-9]/g, ""))}
                        maxLength="8"
                        placeholder="개업일자 (YYYYMMDD)"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="modal-ceo-name" className="form-label">대표자명</label>
                    <input
                        type="text"
                        id="modal-ceo-name"
                        className="form-input"
                        value={ceoName}
                        onChange={(e) => setCeoName(e.target.value)}
                        placeholder="대표자명을 입력하세요"
                        required
                    />
                </div>

                <div className="modal-buttons">
                    <button type="button" onClick={handleConfirm} className="confirm-button">
                        확인
                    </button>
                    <button type="button" onClick={onClose} className="cancel-button">
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdditionalInfoModal;
