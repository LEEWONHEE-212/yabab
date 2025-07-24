import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import './Reserve.css';
import { UserContext } from '../../context/UserContext';

const Reserve = ({ isOpen, onClose, title, restaurantId, availableMenus, restaurantLocation, zoneName }) => {
    const { user } = useContext(UserContext);

    const [requestDetails, setRequestDetails] = useState('');
    const [selectedMenus, setSelectedMenus] = useState([]);

    if (!isOpen) return null;

    const totalPrice = selectedMenus.reduce((sum, menu) => {
        const price = typeof menu.menuPrice === 'number' ? menu.menuPrice : 0;
        return sum + (price * menu.quantity);
    }, 0);

    const handleConfirmReservation = async () => {
        if (!user || !user.userId) {
            alert('예약을 하려면 로그인해야 합니다.');
            return;
        }
        if (selectedMenus.length === 0) {
            alert('메뉴를 1개 이상 선택해주세요.');
            return;
        }

        const menuDetails = selectedMenus.map(menu => `${menu.menuName} (${menu.quantity}개)`).join(', ');

        const confirmMsg = `
            예약 정보를 확인해주세요:

            식당: ${title}
            구역: ${restaurantLocation} ${zoneName}
            선택 메뉴: ${menuDetails}
            총 가격: ${totalPrice.toLocaleString()}원
            요청사항: ${requestDetails || '없음'}

            예약하시겠습니까?
        `;

        if (window.confirm(confirmMsg)) {
            try {
                const reservationPayload = {
                    userId: user.userId,
                    resvRequest: requestDetails,
                    // resvDate, resvTime, resvPersonCount 필드는 현재 UI에서 입력받지 않으므로
                    // 백엔드에서 null을 허용하거나 기본값을 설정해야 합니다.
                    // (ReservationDTO에서 해당 필드들이 Date, String, Integer 타입이므로 null 허용 가능)
                    selectedMenus: selectedMenus.map(menu => ({
                        menuId: menu.menuId,
                        quantity: menu.quantity,
                        menuPriceAtResv: menu.menuPrice
                    }))
                };

                console.log("예약 요청 페이로드:", reservationPayload);

                // ** 백엔드 포트 확인 (예: 8080 또는 18090) **
                const backendPort = 18090; // 또는 18090, 실제 백엔드 포트에 맞춰주세요.
                const response = await fetch(`http://localhost:${backendPort}/api/reservations/${restaurantId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reservationPayload)
                });

                if (response.ok) {
                    const createdReservation = await response.json(); // 응답 본문을 JSON으로 파싱
                    const reservationNumber = createdReservation.resvId; // 생성된 예약 ID 추출

                    // 예약 번호를 포함한 알림 메시지
                    alert(`예약이 성공적으로 확정되었습니다!\n예약번호: ${reservationNumber}`);
                    onClose();
                } else {
                    const errorText = await response.text();
                    console.error('예약 확정 실패:', response.status, response.statusText, errorText);
                    alert(`예약 확정 실패: ${errorText || '알 수 없는 오류'}`);
                }
            } catch (error) {
                console.error('예약 확정 중 오류 발생:', error);
                alert('예약 확정 중 문제가 발생했습니다. 네트워크 연결을 확인하거나 다시 시도해주세요.');
            }
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
                        {restaurantLocation || '정보 없음'} {zoneName || '정보 없음'}
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