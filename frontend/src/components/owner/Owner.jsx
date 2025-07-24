import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import './Owner.css'; // CSS 파일
import EditRestaurant from './EditRestaurant';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';

// ReservationDetailModal 컴포넌트 정의
const ReservationDetailModal = ({ reservation, onClose }) => {
    if (!reservation) return null;

    // 예약 일시 포맷팅 함수는 더 이상 사용되지 않지만, 혹시 다른 곳에서 사용될까봐 유지합니다.
    const formatDateTime = (date, time) => {
        if (!date || !time) return '정보 없음';
        const datePart = date.split('T')[0]; // YYYY-MM-DD
        const timePart = time.substring(0, 5); // HH:MM
        return `${datePart} ${timePart}`;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">주문 번호: {reservation.orderNumber} 상세 내역</h2>
                <div className="modal-section">
                    <h3>총 주문 정보</h3>
                    <p><strong>주문 번호:</strong> {reservation.orderNumber}</p>
                    <p><strong>총 주문 개수:</strong> {reservation.quantity}개</p>
                    <p><strong>총 결제 금액:</strong> {reservation.totalPrice?.toLocaleString() || '0'}원</p>
                    <p><strong>현재 상태:</strong> {reservation.status}</p>
                </div>

                <div className="modal-section">
                    <h3>주문 메뉴 상세</h3>
                    {reservation.reservationMenus && reservation.reservationMenus.length > 0 ? (
                        <table className="modal-menu-table">
                            <thead>
                                <tr>
                                    <th>메뉴 이름</th>
                                    <th>개별 가격</th>
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

// Owner 컴포넌트는 변경 사항이 없습니다.
// (ReservationDetailModal 컴포넌트 호출 부분은 그대로 유지됩니다.)
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
        // user가 없거나 role이 2가 아니면 접근 제한
        if (!user || user.userRole !== 2) {
            alert("식당 관리 페이지에 접근하려면 사장 계정으로 로그인해야 합니다.");
            console.warn("식당 관리 페이지에 접근하려면 사장 계정으로 로그인해야 합니다.");
            navigate('/auth/login');
            return;
        }

        const ownerId = user.userId;

        try {
            const response = await axios.get(`http://localhost:18090/api/owner/restaurants/${ownerId}`);
            setCurrentRestaurant(response.data);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error("fetchRestaurantInfo 실패:", err);
            if (err.response && err.response.status === 404) {
                setCurrentRestaurant(null); // 식당이 없을 때 null로 설정
                setError(null); // 404는 오류 메시지로 표시하지 않음 (식당 등록 유도)
            } else {
                setError("식당 정보를 불러오는데 실패했습니다. (API 서버 확인)");
            }
            setLoading(false);
        }
    }, [user, navigate]);

    // 메뉴 정보를 가져오는 함수 (이전과 동일)
    const fetchMenuItems = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            console.warn("fetchMenuItems: restaurantId가 없어 메뉴 아이템을 가져올 수 없습니다.");
            return;
        }
        try {
            console.log(`fetchMenuItems: http://localhost:18090/api/owner/restaurants/${restaurantId}/menus 호출 시도`);
            const response = await axios.get(`http://localhost:18090/api/owner/restaurants/${restaurantId}/menus`);
            setMenuItems(response.data);
            console.log("fetchMenuItems: 메뉴 아이템 성공적으로 가져옴:", response.data);
            setError(null);
        } catch (err) {
            console.error("fetchMenuItems 실패:", err);
            setError("메뉴 정보를 불러오는데 실패했습니다. (API 서버 확인)");
        }
    }, []);

    // 예약 정보를 가져오는 함수 (수정됨: 주문 번호, 메뉴, 갯수, 총 가격 포함)
    const fetchReservations = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            console.warn("fetchReservations: restaurantId가 없어 예약 정보를 가져올 수 없습니다.");
            return;
        }
        try {
            console.log(`fetchReservations: http://localhost:18090/api/restaurants/${restaurantId}/reservations 호출 시도`);
            const response = await axios.get(`http://localhost:18090/api/restaurants/${restaurantId}/reservations`);
            // 각 예약에 대해 메뉴 정보와 총 가격을 계산하여 추가
            const reservationsWithDetails = response.data.map(reservation => {
                const totalQuantity = reservation.reservationMenus.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = reservation.reservationMenus.reduce((sum, item) => sum + (item.menuPrice * item.quantity), 0);
                const menuNames = reservation.reservationMenus.map(item => item.menuName).join(', '); // 메뉴 이름을 콤마로 연결

                return {
                    ...reservation,
                    orderNumber: reservation.id, // 예약 ID를 주문 번호로 사용
                    menu: menuNames,
                    quantity: totalQuantity,
                    totalPrice: totalPrice,
                    // 고객명과 연락처는 fetchReservations에서는 계속 가져오지만, 모달에서 표시하지 않음
                    customerName: reservation.customer ? reservation.customer.userName : '알 수 없음',
                    customerPhone: reservation.customer ? reservation.customer.userPhone : '알 수 없음',
                };
            });
            setReservations(reservationsWithDetails);
            console.log("fetchReservations: 예약 정보 성공적으로 가져옴:", reservationsWithDetails);
        } catch (err) {
            console.error("fetchReservations 실패:", err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            console.log("useEffect: UserContext의 user가 설정됨. fetchRestaurantInfo 호출");
            fetchRestaurantInfo();
        } else {
            setLoading(true);
        }
    }, [user, fetchRestaurantInfo]);

    useEffect(() => {
        if (currentRestaurant && currentRestaurant.id) {
            console.log("useEffect: currentRestaurant 설정됨. 메뉴/예약 정보 가져오기 시작. Restaurant ID:", currentRestaurant.id);
            fetchMenuItems(currentRestaurant.id);
            fetchReservations(currentRestaurant.id);
        }
    }, [currentRestaurant, fetchMenuItems, fetchReservations]);

    useEffect(() => {
        console.log("menuItems 상태 업데이트 감지:", menuItems);
    }, [menuItems]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:18090/api/reservations/${id}/status`, { status: newStatus });

            setReservations(prevReservations =>
                prevReservations.map(reservation =>
                    reservation.id === id ? { ...reservation, status: newStatus } : reservation
                )
            );
            alert(`예약 ID ${id}의 상태가 ${newStatus}로 변경되었습니다.`);
            console.log(`예약 ID ${id}의 상태가 ${newStatus}로 변경되었습니다.`);
        } catch (error) {
            console.error("handleStatusChange 실패:", error);
            alert("예약 상태 업데이트에 실패했습니다. 서버 로그를 확인해주세요.");
            console.error("예약 상태 업데이트에 실패했습니다. 서버 로그를 확인해주세요.");
        }
    };

    const handleEditClick = () => {
        if (currentRestaurant) {
            setShowEditPage(true);
        } else {
            alert("식당 정보를 불러오는 중이거나 오류가 발생하여 수정할 수 없습니다.");
            console.warn("식당 정보를 불러오는 중이거나 오류가 발생하여 수정할 수 없습니다.");
        }
    };

    const handleReturnToOwnerPage = () => {
        setShowEditPage(false);
        fetchRestaurantInfo(); // 정보 업데이트 후 다시 불러오기
    };

    // 메뉴 추가 핸들러
    const handleAddMenu = async () => {
        if (!newMenuItem.name || !newMenuItem.price) {
            alert('메뉴 이름과 가격을 입력해주세요.');
            console.warn('메뉴 이름과 가격을 입력해주세요.');
            return;
        }
        if (!currentRestaurant || !currentRestaurant.id) {
            alert('식당 정보가 없어 메뉴를 추가할 수 없습니다.');
            console.warn('식당 정보가 없어 메뉴를 추가할 수 없습니다.');
            return;
        }
        if (!user || !user.userId) {
            alert('사용자 정보가 없어 메뉴를 추가할 수 없습니다.');
            console.warn('사용자 정보가 없어 메뉴를 추가할 수 없습니다.');
            return;
        }

        if (window.confirm('메뉴를 추가하시겠습니까?')) {
            try {
                console.log("handleAddMenu: 새 메뉴 추가 시도. Data:", {
                    restaurantId: currentRestaurant.id,
                    menuName: newMenuItem.name,
                    menuPrice: parseInt(newMenuItem.price, 10),
                    createdBy: user.userId
                });
                const response = await axios.post(
                    `http://localhost:18090/api/owner/restaurants/${currentRestaurant.id}/menus`,
                    {
                        restaurantId: currentRestaurant.id,
                        menuName: newMenuItem.name,
                        menuPrice: parseInt(newMenuItem.price, 10),
                        createdBy: user.userId
                    }
                );
                console.log("handleAddMenu: 메뉴 추가 성공 응답:", response.data);
                setMenuItems(prev => [...prev, response.data]);
                setNewMenuItem({ name: '', price: '' });
                alert('메뉴가 성공적으로 추가되었습니다.');
                console.log('메뉴가 성공적으로 추가되었습니다.');
            } catch (error) {
                console.error('handleAddMenu 실패:', error);
                alert('메뉴 추가에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
                console.error('메뉴 추가에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
            }
        }
    };

    // 메뉴 수정 시작 핸들러
    const handleEditMenuStart = (menuItem) => {
        setEditingMenuId(menuItem.menuId);
        setNewMenuItem({
            name: menuItem.menuName,
            price: menuItem.menuPrice?.toString() || '',
        });
        console.log("handleEditMenuStart: 수정할 메뉴 정보:", menuItem);
    };

    // 메뉴 수정 완료 핸들러
    const handleEditMenuSave = async () => {
        if (!newMenuItem.name || !newMenuItem.price) {
            alert('메뉴 이름과 가격을 입력해주세요.');
            console.warn('메뉴 이름과 가격을 입력해주세요.');
            return;
        }
        if (!user || !user.userId) {
            alert('사용자 정보가 없어 메뉴를 수정할 수 없습니다.');
            console.warn('사용자 정보가 없어 메뉴를 수정할 수 없습니다.');
            return;
        }
        if (!editingMenuId) {
            alert('수정할 메뉴가 선택되지 않았습니다.');
            console.warn('수정할 메뉴가 선택되지 않았습니다.');
            return;
        }

        if (window.confirm('메뉴를 수정하시겠습니까?')) {
            try {
                const updatedMenu = {
                    menuName: newMenuItem.name,
                    menuPrice: parseInt(newMenuItem.price, 10),
                };
                console.log("handleEditMenuSave: 메뉴 수정 시도. ID:", editingMenuId, "데이터:", updatedMenu);
                await axios.put(`http://localhost:18090/api/owner/restaurants/menus/${editingMenuId}`, updatedMenu, {
                    params: {
                        ownerId: user.userId
                    }
                });

                setMenuItems(prevMenuItems =>
                    prevMenuItems.map(item =>
                        item.menuId === editingMenuId
                            ? { ...item, menuName: newMenuItem.name, menuPrice: parseInt(newMenuItem.price, 10) }
                            : item
                    )
                );
                setEditingMenuId(null);
                setNewMenuItem({ name: '', price: '' });
                alert('메뉴가 성공적으로 수정되었습니다.');
                console.log('메뉴가 성공적으로 수정되었습니다.');
            } catch (error) {
                console.error('handleEditMenuSave 실패:', error);
                alert('메뉴 수정에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
                console.error('메뉴 수정에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
            }
        }
    };

    // 메뉴 수정 취소 핸들러
    const handleEditMenuCancel = () => {
        setEditingMenuId(null);
        setNewMenuItem({ name: '', price: '' });
    };

    // 메뉴 삭제 핸들러
    const handleDeleteMenu = async (menuId) => {
        if (!menuId) {
            console.error("handleDeleteMenu: 삭제할 메뉴 ID가 유효하지 않습니다.");
            alert("삭제할 메뉴를 선택해 주세요.");
            console.warn("삭제할 메뉴를 선택해 주세요.");
            return;
        }

        if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
            try {
                console.log("handleDeleteMenu: 메뉴 삭제 시도. ID:", menuId);
                await axios.delete(`http://localhost:18090/api/owner/restaurants/menus/${menuId}`);
                setMenuItems(prevMenuItems => prevMenuItems.filter(item => item.menuId !== menuId));
                alert('메뉴가 성공적으로 삭제되었습니다.');
                console.log('메뉴가 성공적으로 삭제되었습니다.');
            } catch (error) {
                console.error('handleDeleteMenu 실패:', error);
                alert('메뉴 삭제에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
                console.error('메뉴 삭제에 실패했습니다. 서버 로그를 확인해주세요: ' + (error.response ? error.response.data.message : error.message));
            }
        }
    };

    // 모달 열기 핸들러
    const handleShowDetail = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetailModal(true);
    };

    // 모달 닫기 핸들러
    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedReservation(null);
    };


    // 초기 로딩 중이거나 사용자 정보가 없는 경우 (권한 없음)
    if (!user || user.userRole !== 2) {
        return (
            <div className="owner-page-container" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                <p>사장님 계정으로 로그인해야 접근할 수 있습니다.</p>
                <Link to="/auth/login" className="login-link">로그인 페이지로 이동</Link>
            </div>
        );
    }

    // 식당 정보 로딩 중 (user가 존재하고 role이 2일 때만)
    if (loading) {
        return (
            <div className="owner-page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <p>식당 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    // 식당 정보 로드 실패
    if (error) {
        return (
            <div className="owner-page-container" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
                <p>{error}</p>
                <p>백엔드 서버가 실행 중인지, 사장님 ID({user ? user.userId : 'N/A'})에 해당하는 식당이 등록되어 있는지 확인해주세요.</p>
            </div>
        );
    }

    // 등록된 식당 정보가 없을 때 (404 처리 후 currentRestaurant가 null인 경우)
    if (!currentRestaurant) {
        return (
            <div className="owner-page-container" style={{ textAlign: 'center', marginTop: '50px' }}>
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
                                            alt={currentRestaurant.restaurantName}
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
                                                <th>갯수</th>
                                                <th>총 가격</th>
                                                <th>상태</th>
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
                                                    <tr key={reservation.id}>
                                                        <td
                                                            className="order-number-cell" // 클릭 가능 스타일 적용
                                                            onClick={() => handleShowDetail(reservation)}
                                                        >
                                                            {reservation.orderNumber}
                                                        </td>
                                                        <td>{reservation.menu}</td>
                                                        <td>{reservation.quantity}</td>
                                                        <td>{reservation.totalPrice?.toLocaleString() || '0'}원</td>
                                                        <td>
                                                            {reservation.status === '대기' && (
                                                                <div className="status-buttons">
                                                                    <button
                                                                        className="status-confirm-btn"
                                                                        onClick={() => handleStatusChange(reservation.id, '예약 완료')}
                                                                    >
                                                                        확인
                                                                    </button>
                                                                    <button
                                                                        className="status-cancel-btn"
                                                                        onClick={() => handleStatusChange(reservation.id, '예약 취소')}
                                                                    >
                                                                        취소
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {reservation.status === '예약 완료' && (
                                                                <span className="status-text status-completed">{reservation.status}</span>
                                                            )}
                                                            {reservation.status === '예약 취소' && (
                                                                <span className="status-text status-canceled">{reservation.status}</span>
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
                                                menuItems.map((item) => {
                                                    console.log("메뉴 테이블 렌더링 중인 아이템:", item);
                                                    return (
                                                        <tr key={item.menuId}>
                                                            <td>{item.menuName}</td>
                                                            <td>{item.menuPrice?.toLocaleString() || '0'}원</td>
                                                            <td>
                                                                <button className="edit-button" onClick={() => handleEditMenuStart(item)}>수정</button>
                                                                <button className="delete-button" onClick={() => handleDeleteMenu(item.menuId)}>삭제</button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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