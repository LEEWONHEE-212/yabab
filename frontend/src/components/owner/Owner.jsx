import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import './Owner.css'; // CSS 파일
import EditRestaurant from './EditRestaurant';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';

// 헬퍼 함수: 숫자 상태 코드를 한글 텍스트로 변환
const getStatusText = (statusCode) => {
    switch (statusCode) {
        case 0: return '예약 대기'; // '대기'로 더 명확하게 표현 가능
        case 1: return '예약 완료';
        case 2: return '예약 취소';
        default: return '알 수 없음';
    }
};

// ReservationDetailModal 컴포넌트 정의
const ReservationDetailModal = ({ reservation, onClose }) => {
    if (!reservation) return null;

    // 모달 내부에서 사용할 상태 텍스트 매핑
    const currentStatusText = getStatusText(reservation.resvStatus); // resvStatus 사용

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* 주문 번호를 resvId로 표시 */}
                <h2 className="modal-title">주문 번호: {reservation.resvId}</h2>
                <div className="modal-section">
                    <h3>총 주문 정보</h3>
                    {/* 주문 번호를 resvId로 표시 */}
                    <p><strong>주문 번호:</strong> {reservation.resvId}</p>
                    <p><strong>총 주문 개수:</strong> {reservation.quantity}개</p>
                    <p><strong>총 결제 금액:</strong> {reservation.totalPrice?.toLocaleString() || '0'}원</p>
                    {/* 상태를 한글 텍스트로 표시 */}
                    <p><strong>현재 상태:</strong> {currentStatusText}</p>
                    <p><strong>요청 사항:</strong> {reservation.resvRequest || '없음'}</p>
                </div>

                <div className="modal-section">
                    <h3>주문 메뉴 상세</h3>
                    {reservation.reservationMenus && reservation.reservationMenus.length > 0 ? (
                        <table className="modal-menu-table">
                            <thead>
                                <tr>
                                    <th>메뉴 이름</th>
                                    <th>가격</th>
                                    <th>수량</th>
                                    <th>합계 금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservation.reservationMenus.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.menuName}</td>
                                        <td>{item.menuPrice?.toLocaleString() || '0'}원</td>
                                        <td>{item.quantity}개</td>
                                        <td>{(item.menuPrice * item.quantity)?.toLocaleString() || '0'}원</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>주문된 메뉴가 없습니다.</p>
                    )}
                </div>
                <button className="modal-close-button" onClick={onClose}>닫기</button>
            </div>
        </div>
    );
};

const Owner = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    const [showEditPage, setShowEditPage] = useState(false);
    const [activeTab, setActiveTab] = useState('reservations');

    const [currentRestaurant, setCurrentRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [reservations, setReservations] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '' });
    const [editingMenuId, setEditingMenuId] = useState(null);

    // 모달 관련 상태 추가
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);

    // 식당 정보를 가져오는 함수
    const fetchRestaurantInfo = useCallback(async () => {
        if (!user || user.userRole !== 2) {
            alert("식당 관리 페이지에 접근하려면 사장 계정으로 로그인해야 합니다.");
            console.warn("Unauthorized access attempt: Not an owner or no user context.");
            navigate('/auth/login');
            return;
        }

        const ownerId = user.userId;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:18090/api/owner/restaurants/${ownerId}`);
            setCurrentRestaurant(response.data);
            setError(null);
        } catch (err) {
            console.error("fetchRestaurantInfo failed:", err);
            if (err.response && err.response.status === 404) {
                setCurrentRestaurant(null);
                setError(null);
            } else {
                setError("식당 정보를 불러오는데 실패했습니다. 서버 상태를 확인해주세요.");
            }
        } finally {
            setLoading(false);
        }
    }, [user, navigate]);

    // 메뉴 정보를 가져오는 함수
    const fetchMenuItems = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            console.warn("fetchMenuItems: restaurantId is missing, cannot fetch menu items.");
            setMenuItems([]);
            return;
        }
        try {
            console.log(`Fetching menu items for restaurant ID: ${restaurantId}`);
            const response = await axios.get(`http://localhost:18090/api/owner/restaurants/${restaurantId}/menus`);
            setMenuItems(response.data);
            console.log("Successfully fetched menu items:", response.data);
            setError(null);
        } catch (err) {
            console.error("fetchMenuItems failed:", err);
            setError("메뉴 정보를 불러오는데 실패했습니다.");
            setMenuItems([]);
        }
    }, []);

    // 예약 정보를 가져오는 함수
    const fetchReservations = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            console.warn("fetchReservations: restaurantId is missing, cannot fetch reservations.");
            setReservations([]);
            return;
        }
        try {
            console.log(`Fetching reservations for restaurant ID: ${restaurantId}`);
            // 백엔드 컨트롤러 경로에 맞게 URL 수정 (예: /owner/reservations/list/{restaurantId})
            const response = await axios.get(`http://localhost:18090/owner/reservations/list/${restaurantId}`);
            const reservationsWithDetails = response.data.map(reservation => {
                const totalQuantity = reservation.reservationMenus.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = reservation.reservationMenus.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
                const menuNames = reservation.reservationMenus.map(item => item.menuName).join(', ');

                return {
                    ...reservation,
                    // 백엔드 DTO에 'resvId'와 'resvStatus' 필드가 있다고 가정합니다.
                    // 만약 백엔드에서 'id', 'status' 등의 이름으로 데이터를 보낸다면 이 부분을 수정해야 합니다.
                    resvId: reservation.resvId || reservation.id, // 둘 중 하나를 사용 (백엔드 명세에 따름)
                    menu: menuNames,
                    quantity: totalQuantity,
                    totalPrice: totalPrice,
                    customerName: reservation.customer?.userName || '알 수 없음',
                    customerPhone: reservation.customer?.userPhone || '알 수 없음',
                    resvStatus: reservation.resvStatus // 백엔드 DTO에 resvStatus가 있다고 가정합니다.
                };
            });
            setReservations(reservationsWithDetails);
            console.log("Successfully fetched reservations:", reservationsWithDetails);
        } catch (err) {
            console.error("fetchReservations failed:", err);
            setReservations([]);
        }
    }, []);

    // Effect for initial restaurant info fetch
    useEffect(() => {
        if (user) {
            console.log("User context set. Attempting to fetch restaurant info.");
            fetchRestaurantInfo();
        } else {
            setLoading(true);
        }
    }, [user, fetchRestaurantInfo]);

    // Effect for fetching menus and reservations when currentRestaurant is available
    useEffect(() => {
        if (currentRestaurant && currentRestaurant.id) {
            console.log(`Current restaurant ID available: ${currentRestaurant.id}. Fetching menus and reservations.`);
            fetchMenuItems(currentRestaurant.id);
            fetchReservations(currentRestaurant.id);
        }
    }, [currentRestaurant, fetchMenuItems, fetchReservations]);

    // 예약 상태 변경 함수
    // newStatus는 1 (예약 완료) 또는 2 (예약 취소)가 될 것입니다.
    const handleStatusChange = async (resvId, newStatus) => {
        const statusText = getStatusText(newStatus); // 텍스트로 확인 메시지 생성
        if (!window.confirm(`예약 번호 ${resvId}의 상태를 '${statusText}'으로 변경하시겠습니까?`)) {
            return;
        }
        try {
            // 백엔드 /owner/reservations/status PUT 요청
            // 백엔드 API가 { resvId, newStatus, updaterId }를 JSON Body로 받도록 가정합니다.
            await axios.put(`http://localhost:18090/owner/reservations/status`, {
                resvId: resvId,
                newStatus: newStatus,
                updaterId: user?.userId // 현재 로그인한 사장님 ID 전달
            });
            // 상태 업데이트 성공 후 프론트엔드 상태도 업데이트
            setReservations(prevReservations =>
                prevReservations.map(reservation =>
                    reservation.resvId === resvId ? { ...reservation, resvStatus: newStatus } : reservation
                )
            );
            alert(`예약 번호 ${resvId}의 상태가 '${statusText}'로 변경되었습니다.`);
        } catch (error) {
            console.error("Failed to update reservation status:", error);
            alert("예약 상태 업데이트에 실패했습니다. 서버 로그를 확인해주세요.");
        }
    };


    const handleEditClick = () => {
        if (currentRestaurant) {
            setShowEditPage(true);
        } else {
            alert("식당 정보를 불러오는 중이거나 오류가 발생하여 수정할 수 없습니다.");
            console.warn("Cannot edit: Restaurant info not available.");
        }
    };

    const handleReturnToOwnerPage = () => {
        setShowEditPage(false);
        fetchRestaurantInfo(); // Re-fetch restaurant info after editing
    };

    const handleAddMenu = async () => {
        if (!newMenuItem.name.trim() || !newMenuItem.price) {
            alert('메뉴 이름과 가격을 입력해주세요.');
            return;
        }
        if (isNaN(parseInt(newMenuItem.price, 10)) || parseInt(newMenuItem.price, 10) <= 0) {
            alert('가격은 유효한 숫자로 입력해주세요.');
            return;
        }
        if (!currentRestaurant?.id) {
            alert('식당 정보가 없어 메뉴를 추가할 수 없습니다.');
            return;
        }
        if (!user?.userId) {
            alert('사용자 정보가 없어 메뉴를 추가할 수 없습니다.');
            return;
        }

        if (window.confirm('메뉴를 추가하시겠습니까?')) {
            try {
                const menuData = {
                    restaurantId: currentRestaurant.id,
                    menuName: newMenuItem.name.trim(),
                    menuPrice: parseInt(newMenuItem.price, 10),
                    createdBy: user.userId
                };
                const response = await axios.post(
                    `http://localhost:18090/api/owner/restaurants/${currentRestaurant.id}/menus`,
                    menuData
                );
                setMenuItems(prev => [...prev, response.data]);
                setNewMenuItem({ name: '', price: '' });
                alert('메뉴가 성공적으로 추가되었습니다.');
            } catch (error) {
                console.error('Failed to add menu:', error);
                alert('메뉴 추가에 실패했습니다: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEditMenuStart = (menuItem) => {
        setEditingMenuId(menuItem.menuId);
        setNewMenuItem({
            name: menuItem.menuName,
            price: menuItem.menuPrice?.toString() || '',
        });
    };

    const handleEditMenuSave = async () => {
        if (!newMenuItem.name.trim() || !newMenuItem.price) {
            alert('메뉴 이름과 가격을 입력해주세요.');
            return;
        }
        if (isNaN(parseInt(newMenuItem.price, 10)) || parseInt(newMenuItem.price, 10) <= 0) {
            alert('가격은 유효한 숫자로 입력해주세요.');
            return;
        }
        if (!user?.userId) {
            alert('사용자 정보가 없어 메뉴를 수정할 수 없습니다.');
            return;
        }
        if (!editingMenuId) {
            alert('수정할 메뉴가 선택되지 않았습니다.');
            return;
        }

        if (window.confirm('메뉴를 수정하시겠습니까?')) {
            try {
                const updatedMenu = {
                    menuName: newMenuItem.name.trim(),
                    menuPrice: parseInt(newMenuItem.price, 10),
                };
                await axios.put(`http://localhost:18090/api/owner/restaurants/menus/${editingMenuId}`, updatedMenu, {
                    params: {
                        ownerId: user.userId
                    }
                });

                setMenuItems(prevMenuItems =>
                    prevMenuItems.map(item =>
                        item.menuId === editingMenuId
                            ? { ...item, menuName: newMenuItem.name.trim(), menuPrice: parseInt(newMenuItem.price, 10) }
                            : item
                    )
                );
                setEditingMenuId(null);
                setNewMenuItem({ name: '', price: '' });
                alert('메뉴가 성공적으로 수정되었습니다.');
            } catch (error) {
                console.error('Failed to save menu edit:', error);
                alert('메뉴 수정에 실패했습니다: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEditMenuCancel = () => {
        setEditingMenuId(null);
        setNewMenuItem({ name: '', price: '' });
    };

    const handleDeleteMenu = async (menuId) => {
        if (!menuId) {
            alert("삭제할 메뉴를 선택해 주세요.");
            return;
        }

        if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:18090/api/owner/restaurants/menus/${menuId}`);
                setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.menuId !== menuId));
                alert('메뉴가 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('Failed to delete menu:', error);
                alert('메뉴 삭제에 실패했습니다: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleShowDetail = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReservation(null);
    };

    // Render logic for different states
    if (!user || user.userRole !== 2) {
        return (
            <div className="owner-page-container unauthorized">
                <p className="error-message">사장님 계정으로 로그인해야 접근할 수 있습니다.</p>
                <Link to="/auth/login" className="login-link">로그인 페이지로 이동</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="owner-page-container loading">
                <p>식당 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="owner-page-container error-state">
                <p className="error-message">{error}</p>
                <p className="error-detail">백엔드 서버가 실행 중인지, 사장님 ID({user?.userId || 'N/A'})에 해당하는 식당이 등록되어 있는지 확인해주세요.</p>
            </div>
        );
    }

    if (!currentRestaurant) {
        return (
            <div className="owner-page-container no-restaurant">
                <p>아직 등록된 식당 정보가 없습니다. 식당을 등록해주세요.</p>
                <button className="add-restaurant-button" onClick={() => navigate('/add-AddRestaurant')}>식당 등록하기</button>
            </div>
        );
    }

    return (
        <>
            <Header />

            <div className="owner-page-container">
                {showEditPage ? (
                    <EditRestaurant
                        restaurantData={currentRestaurant}
                        onSave={handleReturnToOwnerPage}
                        onCancel={handleReturnToOwnerPage}
                    />
                ) : (
                    <>
                        <h1 className="section-title main-title">사장님 페이지</h1>

                        {/* 식당 정보 섹션 */}
                        <div className="restaurant-info-section">
                            <div className="restaurant-image-and-button-container">
                                <div className="restaurant-image-placeholder">
                                    {currentRestaurant.restaurantImagePath ? (
                                        <img
                                            src={`http://localhost:18090${currentRestaurant.restaurantImagePath}`}
                                            alt={`${currentRestaurant.restaurantName} 이미지`}
                                            className="restaurant-current-image"
                                        />
                                    ) : (
                                        <p>이미지 없음</p>
                                    )}
                                </div>
                                <button className="edit-button" onClick={handleEditClick}>정보 수정</button>
                            </div>

                            <div className="restaurant-text-content">
                                <div className="restaurant-name">{currentRestaurant.restaurantName}</div>
                                <div className="restaurant-additional-info">
                                    <p>구장 이름: {currentRestaurant.stadiumName}</p>
                                    <p>구역: {currentRestaurant.zoneName}</p>
                                    <p>상세 구역: {currentRestaurant.restaurantLocation}</p>
                                    <p>예약 가능 여부: {currentRestaurant.restaurantResvStatus === 0 ? '가능' : '불가능'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 탭 메뉴 */}
                        <div className="tabs-container">
                            <button
                                className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reservations')}
                            >
                                예약 내역 리스트
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
                                onClick={() => setActiveTab('menu')}
                            >
                                메뉴
                            </button>
                        </div>

                        {/* 예약 내역 리스트 섹션 */}
                        {activeTab === 'reservations' && (
                            <div className="reservation-list-section">
                                <h2 className="section-title">예약 내역 리스트</h2>
                                <div className="reservation-table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>주문 번호</th>
                                                <th>메뉴</th>
                                                <th>개수</th>
                                                <th>총 가격</th>
                                                <th>상태</th> {/* 상태 컬럼 */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reservations.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                                        등록된 예약 내역이 없습니다.
                                                    </td>
                                                </tr>
                                            ) : (
                                                reservations.map((reservation) => (
                                                    // key를 reservation.resvId로 변경 (orderNumber 대신)
                                                    <tr key={reservation.resvId}>
                                                        <td
                                                            className="order-number-cell"
                                                            onClick={() => handleShowDetail(reservation)}
                                                            title="클릭하여 상세 보기"
                                                        >
                                                            {reservation.resvId} {/* 주문 번호를 resvId로 표시 */}
                                                        </td>
                                                        <td>{reservation.menu}</td>
                                                        <td>{reservation.quantity}</td>
                                                        <td>{reservation.totalPrice?.toLocaleString() || '0'}원</td>
                                                        <td>
                                                            {/* resvStatus 값에 따라 버튼 또는 텍스트 렌더링 */}
                                                            {reservation.resvStatus === 0 ? (
                                                                <div className="status-buttons">
                                                                    <button
                                                                        className="status-confirm-btn"
                                                                        onClick={() => handleStatusChange(reservation.resvId, 1)} // 1: 예약 완료
                                                                    >
                                                                        확인
                                                                    </button>
                                                                    <button
                                                                        className="status-cancel-btn"
                                                                        onClick={() => handleStatusChange(reservation.resvId, 2)} // 2: 예약 취소
                                                                    >
                                                                        취소
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                // 상태 텍스트는 헬퍼 함수를 사용하여 표시
                                                                // CSS 클래스도 상태에 따라 동적으로 부여
                                                                <span className={`status-text status-${getStatusText(reservation.resvStatus).replace(/\s/g, '').toLowerCase()}`}>
                                                                    {getStatusText(reservation.resvStatus)}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 메뉴 관리 섹션 */}
                        {activeTab === 'menu' && (
                            <div className="menu-management-section">
                                <h2 className="section-title">메뉴 관리</h2>

                                {/* 메뉴 추가/수정 폼 */}
                                <div className="menu-input-form">
                                    <input
                                        type="text"
                                        placeholder="메뉴 이름"
                                        value={newMenuItem.name}
                                        onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="가격"
                                        value={newMenuItem.price}
                                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                                        min="0"
                                    />
                                    {editingMenuId ? (
                                        <>
                                            <button className="save-button" onClick={handleEditMenuSave}>수정 완료</button>
                                            <button className="cancel-button" onClick={handleEditMenuCancel}>취소</button>
                                        </>
                                    ) : (
                                        <button className="add-menu-button" onClick={handleAddMenu}>메뉴 추가</button>
                                    )}
                                </div>

                                {/* 메뉴 리스트 */}
                                <div className="menu-list-table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>메뉴 이름</th>
                                                <th>가격</th>
                                                <th>관리</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {menuItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                                        등록된 메뉴가 없습니다.
                                                    </td>
                                                </tr>
                                            ) : (
                                                menuItems.map((item) => (
                                                    <tr key={item.menuId}>
                                                        <td>{item.menuName}</td>
                                                        <td>{item.menuPrice?.toLocaleString() || '0'}원</td>
                                                        <td>
                                                            <button className="edit-button" onClick={() => handleEditMenuStart(item)}>수정</button>
                                                            <button className="delete-button" onClick={() => handleDeleteMenu(item.menuId)}>삭제</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* 모달 렌더링 */}
            {showDetailModal && (
                <ReservationDetailModal
                    reservation={selectedReservation}
                    onClose={handleCloseDetailModal}
                />
            )}
        </>
    );
};

export default Owner;