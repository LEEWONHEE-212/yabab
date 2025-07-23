import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './Reserve.css';

// availableMenus, restaurantLocation, zoneName prop을 추가합니다.
const Reserve = ({ isOpen, onClose, title, availableMenus, restaurantLocation, zoneName }) => {
    const [requestDetails, setRequestDetails] = useState('');
    const [selectedMenus, setSelectedMenus] = useState([]);

    if (!isOpen) return null;

    // ✨ 총 가격 계산 로직 추가
    const totalPrice = selectedMenus.reduce((sum, menu) => {
        // menu.menuPrice가 숫자인지 확인하고, 없거나 유효하지 않으면 0으로 처리
        const price = typeof menu.menuPrice === 'number' ? menu.menuPrice : 0;
        return sum + (price * menu.quantity);
    }, 0);

    const handleConfirmReservation = () => {
        if (selectedMenus.length === 0) {
            alert('메뉴를 1개 이상 선택해주세요.');
            return;
        }

        const menuDetails = selectedMenus.map(menu => `${menu.menuName} (${menu.quantity}개)`).join(', ');

        const confirmMsg = `
            예약 정보를 확인해주세요:

            선택 메뉴: ${menuDetails}
            총 가격: ${totalPrice.toLocaleString()}원
            요청사항: ${requestDetails || '없음'}

            예약하시겠습니까?
        `;

        if (window.confirm(confirmMsg)) {
            alert('예약이 확정되었습니다!');
            onClose();
        }
    };

    const handleCancelReservation = () => {
        onClose();
    };

    const handleAddMenu = (menuIdToAdd) => {
        const existingMenu = selectedMenus.find(menu => menu.menuId === menuIdToAdd);
        if (existingMenu) {
            setSelectedMenus(selectedMenus.map(menu =>
                menu.menuId === menuIdToAdd ? { ...menu, quantity: menu.quantity + 1 } : menu
            ));
        } else {
            const menuToAdd = availableMenus.find(menu => menu.menuId === menuIdToAdd);
            if (menuToAdd) {
                setSelectedMenus([...selectedMenus, { ...menuToAdd, quantity: 1 }]);
            }
        }
    };

    const handleMenuQuantityChange = (menuIdToChange, delta) => {
        setSelectedMenus(selectedMenus.map(menu => {
            if (menu.menuId === menuIdToChange) {
                const newQuantity = menu.quantity + delta;
                if (newQuantity < 1) return null;
                return { ...menu, quantity: newQuantity };
            }
            return menu;
        }).filter(Boolean));
    };

    const handleRemoveMenu = (menuIdToRemove) => {
        setSelectedMenus(selectedMenus.filter(menu => menu.menuId !== menuIdToRemove));
    };

    return ReactDOM.createPortal(
        <div className="reservation-modal-overlay" onClick={onClose}>
            <div className="reservation-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="reservation-close-button" onClick={onClose}>&times;</div>
                <div className="reservation-header">
                    <h1 className="reservation-title">{title}</h1>
                    <p className="reservation-address">
                        {restaurantLocation || '정보 없음'}{zoneName || '정보 없음'}
                    </p>
                </div>

                <div className="form-group">
                    <label className="form-label">메뉴 선택</label>
                    <div className="menu-selection-container">
                        <div className="available-menus">
                            <h4>메뉴</h4>
                            <ul className="menu-list">
                                {availableMenus.map(menu => (
                                    <li key={menu.menuId}>
                                        {menu.menuName} ({menu.menuPrice?.toLocaleString()}원)
                                        <button onClick={() => handleAddMenu(menu.menuId)} className="add-menu-button">+</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="selected-menus">
                            <h4>선택된 메뉴</h4>
                            {selectedMenus.length === 0 ? (
                                <p>선택된 메뉴가 없습니다.</p>
                            ) : (
                                <ul className="menu-list">
                                    {selectedMenus.map(menu => (
                                        <li key={menu.menuId}>
                                            <span>{menu.menuName}</span>
                                            <div className="quantity-controls">
                                                <button onClick={() => handleMenuQuantityChange(menu.menuId, -1)}>-</button>
                                                <span>{menu.quantity}</span>
                                                <button onClick={() => handleMenuQuantityChange(menu.menuId, 1)}>+</button>
                                                <button onClick={() => handleRemoveMenu(menu.menuId)} className="remove-menu-button">x</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* ✨ 총 가격 표시 */}
                            {selectedMenus.length > 0 && (
                                <div className="total-price-display">
                                    <strong>총 가격: {totalPrice.toLocaleString()}원</strong>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="request-section" style={{ flexGrow: 1, marginBottom: '20px' }}>
                    <label htmlFor="request-details" className="request-textarea-label">요청사항</label>
                    <textarea
                        id="request-details"
                        className="request-textarea"
                        placeholder="요청사항 입력"
                        value={requestDetails}
                        onChange={(e) => setRequestDetails(e.target.value)}
                    ></textarea>
                </div>

                <div className="button-group">
                    <button
                        className="confirm-reserve-button"
                        onClick={handleConfirmReservation}
                    >
                        예약 확정
                    </button>
                    <button
                        className="cancel-reserve-button"
                        onClick={handleCancelReservation}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Reserve;