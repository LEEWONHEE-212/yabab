import React, { useState, useEffect, useContext } from 'react';
import './Restaurant.css';
import InfoAlertModal from './InfoAlertModal';
import Reserve from './Reserve';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';
import ReportReasonModal from './ReportReasonModal';

// 별점 컴포넌트 (변동 없음)
const StarRating = ({ rating, setRating }) => {
    return (
        <div className="restaurant-star-rating">
            {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className={index <= rating ? "on" : "off"}
                        onClick={() => setRating(index)}
                    >
                        <span className="star">&#9733;</span>
                    </button>
                );
            })}
        </div>
    );
};

const Restaurant = ({ restaurant, onClose }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);

    // 후기 관련 상태
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewImage, setReviewImage] = useState(null); // 리뷰 이미지 파일 상태
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;

    // 실제 불러온 식당 데이터 (리뷰 및 메뉴 포함)를 저장할 상태
    const [currentRestaurantData, setCurrentRestaurantData] = useState(restaurant);

    // 이미지 모달 관련 상태 추가
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(''); // 크게 볼 이미지 URL

    // 신고 모달 관련 상태 추가
    const [isReportReasonModalOpen, setIsReportReasonModalOpen] = useState(false); // 신고 사유 모달
    const [reviewToReport, setReviewToReport] = useState(null); // 신고할 리뷰 정보 (ID와 내용)

    // UserContext에서 사용자 정보 가져오기
    const { user, isLoading } = useContext(UserContext);
    const isLoggedIn = !!user; // user 객체가 있으면 로그인 상태로 간주

    const navigate = useNavigate();

    // 모달이 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (isAlertModalOpen || isReserveModalOpen || showImageModal || isReportReasonModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAlertModalOpen, isReserveModalOpen, showImageModal, isReportReasonModalOpen]);

    // 식당 상세 정보를 다시 불러오는 함수 (API 경로 수정 및 메뉴 좋아요 정보 포함)
    const fetchRestaurantDetails = async (restaurantId) => {
        console.log(`[fetchRestaurantDetails] 레스토랑 ID: ${restaurantId} - 상세 정보 로드 시작`);
        if (!restaurantId) {
            console.warn("[fetchRestaurantDetails] restaurantId is undefined, cannot fetch details.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:18090/api/Reviews/${restaurantId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("[fetchRestaurantDetails] 초기 식당 상세 정보 (리뷰 포함):", data);
                console.log("[fetchRestaurantDetails] 원본 메뉴 데이터:", data.menus);

                // 메뉴 데이터 처리: 각 메뉴의 좋아요 상태를 백엔드에서 직접 가져옴
                const menusWithLikeStatus = await Promise.all(
                    (data.menus || []).map(async (menu) => {
                        // isLikedByUser 대신 likedByUser로 초기화
                        let likeStatus = { likeCount: 0, likedByUser: false }; // 기본값 설정
                        
                        // 사용자가 로그인했을 경우에만 좋아요 상태를 요청
                        if (user && user.userId) {
                            console.log(`[fetchRestaurantDetails] 사용자 로그인됨 (${user.userId}), 메뉴 ${menu.menuId}의 좋아요 상태 요청.`);
                            try {
                                const likeResponse = await fetch(`http://localhost:18090/api/menus/${menu.menuId}/like/status?userId=${user.userId}`);
                                if (likeResponse.ok) {
                                    likeStatus = await likeResponse.json();
                                    console.log(`[fetchRestaurantDetails] 메뉴 ${menu.menuId} 좋아요 상태 API 응답:`, likeStatus);
                                } else {
                                    console.warn(`[fetchRestaurantDetails] 메뉴 ${menu.menuId}의 좋아요 상태를 가져오는데 실패:`, likeResponse.status, await likeResponse.text());
                                }
                            } catch (error) {
                                console.error(`[fetchRestaurantDetails] 메뉴 ${menu.menuId}의 좋아요 상태 API 호출 오류:`, error);
                            }
                        } else {
                            console.log(`[fetchRestaurantDetails] 사용자 로그인되지 않음, 메뉴 ${menu.menuId}에 기본 좋아요 상태 적용.`);
                        }
                        
                        const finalMenu = {
                            ...menu,
                            likeCount: likeStatus.likeCount,
                            // isLikedByUser 대신 likedByUser 사용
                            likedByUser: likeStatus.likedByUser, 
                        };
                        console.log(`[fetchRestaurantDetails] 메뉴 ${menu.menuId}의 최종 객체:`, finalMenu);
                        return finalMenu;
                    })
                );
                console.log("[fetchRestaurantDetails] 모든 메뉴 좋아요 상태 처리 완료:", menusWithLikeStatus);
                setCurrentRestaurantData({ ...data, menus: menusWithLikeStatus });
                console.log("[fetchRestaurantDetails] currentRestaurantData 업데이트 완료.");

            } else {
                const errorText = await response.text();
                console.error('[fetchRestaurantDetails] 식당 상세 정보 가져오기 실패.', response.status, response.statusText, errorText);
            }
        } catch (error) {
            console.error('[fetchRestaurantDetails] 식당 상세 정보 가져오기 중 오류 발생:', error);
        }
    };

    // 컴포넌트 마운트 시 (또는 restaurant prop 변경 시) 초기 데이터 로드
    useEffect(() => {
        console.log("[useEffect] restaurant 또는 user 변경 감지. fetchRestaurantDetails 호출.");
        if (restaurant && restaurant.id) {
            fetchRestaurantDetails(restaurant.id);
        }
    }, [restaurant, user]); // user가 변경될 때도 좋아요 상태를 새로고침해야 할 수 있으므로 의존성 추가

    if (isLoading || !currentRestaurantData || !currentRestaurantData.restaurantName) {
        console.log("[렌더링] 로딩 중 또는 데이터 없음.");
        return null; // 또는 로딩 스피너 등을 표시
    }

    // 후기 페이지네이션 로직 조정
    const allReviews = currentRestaurantData.reviews || [];
    const currentReviews = allReviews.slice(
        (currentPage - 1) * reviewsPerPage,
        currentPage * reviewsPerPage
    );
    const totalReviews = currentRestaurantData.reviewCount !== undefined ? currentRestaurantData.reviewCount : allReviews.length;
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 이미지 파일 변경 핸들러
    const handleImageChange = (e) => {
        setReviewImage(e.target.files[0]);
    };

    // 리뷰 이미지 클릭 핸들러
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // 이미지 모달 닫기 핸들러
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage('');
    };

    // 후기 제출 핸들러 - API 호출 로직 추가 (multipart/form-data 전송으로 변경)
    const handleSubmitReview = async () => {
        if (!isLoggedIn) {
            alert('리뷰를 작성하려면 로그인해야 합니다.');
            return;
        }

        if (!window.confirm("리뷰를 작성하시겠습니까?")) {
            return;
        }

        if (!reviewText.trim() || reviewRating === 0) {
            alert('후기와 별점을 모두 입력해주세요.');
            return;
        }

        if (!user || !user.userId) {
            alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해 주세요.');
            console.error('User ID is missing from UserContext. User object:', user);
            return;
        }

        const formData = new FormData();

        const reviewPayload = {
            userId: user.userId,
            reviewRating: reviewRating,
            reviewContent: reviewText.trim(),
        };
        formData.append('reviewData', new Blob([JSON.stringify(reviewPayload)], { type: 'application/json' }));

        if (reviewImage) {
            formData.append('imageFile', reviewImage);
        }

        console.log("Submitting FormData:");
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }

        try {
            const response = await fetch(`http://localhost:18090/api/Reviews/${currentRestaurantData.id}/reviews`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 작성되었습니다.');
                await fetchRestaurantDetails(currentRestaurantData.id);
                setReviewText('');
                setReviewRating(0);
                setReviewImage(null);
                setActiveTab('review');
            } else {
                const errorData = await response.text();
                let errorMessage = `리뷰 작성 실패: ${errorData || '알 수 없는 서버 오류'}`;

                try {
                    const jsonError = JSON.parse(errorData);
                    if (jsonError.message) {
                        errorMessage = `리뷰 작성 실패: ${jsonError.message}`;
                    }
                } catch (e) {
                    // JSON 파싱 실패 시 원래 텍스트 에러 메시지 사용
                }

                alert(errorMessage);
                console.error('리뷰 작성 실패:', response.status, response.statusText, errorData);
            }
        } catch (error) {
            console.error('리뷰 제출 중 오류 발생:', error);
            alert('리뷰 작성 중 문제가 발생했습니다. 네트워크 연결을 확인하거나 다시 시도해주세요.');
        }
    };

    const handleReserve = () => {
        if (!isLoggedIn) {
            alert('예약을 하려면 로그인해야 합니다.');
            return;
        }
        console.log('예약하기 버튼 클릭됨');
        setIsAlertModalOpen(true);
    };

    const closeAlertModal = () => {
        setIsAlertModalOpen(false);
        setIsReserveModalOpen(true);
    };

    const closeReservationModal = () => {
        setIsReserveModalOpen(false);
    };

    const alertMessage = `예약 시 시간과 날짜 확인 부탁드립니다. 착오로 인한 예약 변경이나 취소는 불가하니 예약 전 반드시 날짜와 시간을 다시 한번 확인해 주세요.`;

    // 이미지 경로를 조합합니다. (prop restaurant.restaurantImagePath 사용)
    const fullImageUrl = currentRestaurantData.restaurantImagePath
        ? `http://localhost:18090${currentRestaurantData.restaurantImagePath}`
        : '/default-restaurant-image.jpg'; // 폴백 이미지

    // 기존 handleReportReview 수정: 신고 사유 모달을 띄우도록
    const handleReportReview = (review) => { // review 객체 전체를 받도록 변경
        if (!isLoggedIn) {
            alert('리뷰를 신고하려면 로그인해야 합니다.');
            return;
        }

        // 로그인한 사용자가 본인 리뷰를 신고하는 것을 방지
        if (user && user.userId === review.userId) {
            alert('본인이 작성한 리뷰는 신고할 수 없습니다.');
            return;
        }
        
        // 신고 사유 모달을 열기 전에 신고할 리뷰 정보를 상태에 저장
        setReviewToReport(review);
        setIsReportReasonModalOpen(true);
    };

    // ReportReasonModal에서 제출 시 호출될 함수
    const onReportSubmit = async (reviewId, reportReason, reportDetails) => {
        console.log(`신고 제출: reviewId=${reviewId}, reason=${reportReason}, details=${reportDetails}, reporterUserId=${user.userId}, reportedUserId=${reviewToReport?.userId}`);
        
        try {
            const response = await fetch(`http://localhost:18090/api/Reviews/${reviewId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${user.token}` // 인증 토큰이 필요하다면 추가
                },
                body: JSON.stringify({
                    reporterUserId: user.userId, // 신고자 ID
                    reportedUserId: reviewToReport?.userId, // 신고 대상 리뷰 작성자 ID
                    reportReason: reportReason,  // 선택된 사유
                    reportDetails: reportDetails // 상세 사유
                })
            });

            if (response.ok) {
                alert('리뷰가 성공적으로 신고되었습니다. 관리자 확인 후 조치될 예정입니다.');
                // 신고 성공 후 리뷰 목록을 다시 불러오는 것이 좋습니다.
                await fetchRestaurantDetails(currentRestaurantData.id); // 리뷰 목록 새로고침
            } else {
                const errorText = await response.text();
                console.error('리뷰 신고 실패:', response.status, response.statusText, errorText);
                alert(`리뷰 신고 실패: ${errorText || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('리뷰 신고 중 오류 발생:', error);
            alert('리뷰 신고 중 문제가 발생했습니다. 네트워크 연결을 확인하거나 다시 시도해주세요.');
        }
    };

    // 메뉴 좋아요 버튼 클릭 핸들러
    const handleLikeMenu = async (menuId, currentIsLiked) => { // currentIsLiked는 이제 사용되지 않음
        if (!isLoggedIn) {
            alert('메뉴에 좋아요를 누르려면 로그인해야 합니다.');
            return;
        }
        if (!user || !user.userId) {
            alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해 주세요.');
            console.error('User ID is missing from UserContext. User object:', user);
            return;
        }

        console.log(`[handleLikeMenu] 메뉴 ID: ${menuId}, 현재 좋아요 상태 (클릭 전): ${currentRestaurantData.menus.find(m => m.menuId === menuId)?.likedByUser}`);

        // 백엔드 API 호출 로직 활성화
        const endpoint = `http://localhost:18090/api/menus/${menuId}/like`;
        const method = 'POST'; // 좋아요 토글은 항상 POST로 요청하고, 백엔드에서 상태에 따라 처리

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${user.token}` // 인증 토큰이 필요하다면 추가
                },
                body: JSON.stringify({
                    menuId: menuId, // DTO에 menuId 포함
                    userId: user.userId
                })
            });

            if (response.ok) {
                const updatedStatus = await response.json(); // 백엔드에서 반환하는 최신 좋아요 상태 및 수
                console.log(`[handleLikeMenu] 백엔드 응답 성공. 새 상태:`, updatedStatus);

                // currentRestaurantData 상태를 직접 업데이트하여 UI를 효율적으로 반영
                setCurrentRestaurantData(prevData => {
                    console.log("[setCurrentRestaurantData] 이전 메뉴 데이터:", prevData.menus);
                    const updatedMenus = prevData.menus.map(menu => {
                        // 여기가 수정된 부분: updatedStatus.menuId를 사용하여 정확한 메뉴를 찾습니다.
                        if (menu.menuId === updatedStatus.menuId) { 
                            console.log(`[setCurrentRestaurantData] 메뉴 ${menu.menuId} 업데이트: likedByUser ${menu.likedByUser} -> ${updatedStatus.likedByUser}`);
                            return {
                                ...menu,
                                likeCount: updatedStatus.likeCount,
                                // isLikedByUser 대신 likedByUser 사용
                                likedByUser: updatedStatus.likedByUser 
                            };
                        }
                        return menu;
                    });
                    console.log("[setCurrentRestaurantData] 업데이트된 메뉴 데이터:", updatedMenus);
                    return { ...prevData, menus: updatedMenus };
                });
            } else {
                const errorText = await response.text();
                console.error('메뉴 좋아요 처리 실패:', response.status, errorText);
                alert(`메뉴 좋아요 처리 실패: ${errorText || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error('메뉴 좋아요 처리 중 오류 발생:', error);
            alert('메뉴 좋아요 처리 중 문제가 발생했습니다. 네트워크 연결을 확인하거나 다시 시도해주세요.');
        }
    };


    return (
        <div className="restaurant-modal-backdrop" onClick={onClose}>
            <div className="restaurant-modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
                <span className="restaurant-modal-close-button" onClick={onClose}>&times;</span>

                <div className="restaurant-modal-container">
                    <div className="restaurant-images-placeholder">
                        <img src={fullImageUrl} alt={currentRestaurantData.restaurantName} className="restaurant-detail-img" />
                    </div>

                    <div className="restaurant-tabs">
                        <button
                            className={`restaurant-tab-button ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            정보
                        </button>
                        <button
                            className={`restaurant-tab-button ${activeTab === 'menu' ? 'active' : ''}`}
                            onClick={() => setActiveTab('menu')}
                        >
                            메뉴
                        </button>
                        <button
                            className={`restaurant-tab-button ${activeTab === 'review' ? 'active' : ''}`}
                            onClick={() => setActiveTab('review')}
                        >
                            후기
                        </button>
                    </div>

                    <div className="restaurant-section-content">
                        {activeTab === 'info' && (
                            <>
                                <h1 className="restaurant-info-name">{currentRestaurantData.restaurantName || '식당 이름'}</h1>
                                <p className="restaurant-info-detail-text"><strong>구장 이름:</strong> {currentRestaurantData.stadiumName || '정보 없음'}</p>
                                <p className="restaurant-info-detail-text"><strong>구역:</strong> {currentRestaurantData.restaurantLocation || '정보 없음'}</p>
                                <p className="restaurant-info-detail-text"><strong>상세 구역:</strong> {currentRestaurantData.zoneName || '정보 없음'}</p>
                                <p className="restaurant-info-detail-text">
                                    <strong>예약 가능 여부: </strong>
                                    {currentRestaurantData.restaurantResvStatus === 0 ? '가능' : '불가능'}
                                </p>
                                <p className="restaurant-info-detail-text">
                                    <strong>평균 별점: </strong>
                                    {currentRestaurantData.averageRating !== undefined ? currentRestaurantData.averageRating.toFixed(1) : 'N/A'}
                                </p>
                                <p className="restaurant-info-detail-text">
                                    <strong>리뷰 개수: </strong>
                                    {currentRestaurantData.reviewCount !== undefined ? currentRestaurantData.reviewCount : 'N/A'}
                                </p>
                            </>
                        )}

                        {activeTab === 'menu' && (
                            <div className="restaurant-menu-section">
                                <h2>메뉴</h2>
                                {currentRestaurantData.menus && currentRestaurantData.menus.length > 0 ? (
                                    <ul className="restaurant-menu-list">
                                        {currentRestaurantData.menus.map((item) => {
                                            // isLikedByUser 대신 likedByUser 사용
                                            console.log(`[렌더링] 메뉴 ID: ${item.menuId}, likedByUser: ${item.likedByUser}, 클래스: restaurant-like-button ${item.likedByUser ? 'liked' : ''}`);
                                            return (
                                                <li key={item.menuId} className="restaurant-menu-item">
                                                    <span className="restaurant-menu-item-name">{item.menuName}</span>
                                                    <span className="restaurant-menu-item-price">{item.menuPrice?.toLocaleString()}원</span>
                                                    {/* 좋아요 버튼 및 횟수 추가 */}
                                                    <div className="restaurant-menu-like-section">
                                                        <button
                                                            // isLikedByUser 대신 likedByUser 사용
                                                            className={`restaurant-like-button ${item.likedByUser ? 'liked' : ''}`}
                                                            onClick={() => handleLikeMenu(item.menuId, item.likedByUser)}
                                                            disabled={!isLoggedIn} // 로그인하지 않으면 비활성화
                                                        >
                                                            {/* 유니코드 이모지 하트 직접 사용 */}
                                                            {item.likedByUser ? '❤️' : '🤍'}
                                                        </button>
                                                        {/* 좋아요 횟수 (좋아요수) 형식으로 변경 */}
                                                        <span className="restaurant-like-count">({item.likeCount})</span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p>메뉴 정보가 없습니다.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'review' && (
                            <div className="restaurant-review-section">
                                <h2>후기 ({totalReviews}개)</h2>
                                {allReviews.length > 0 ? (
                                    <>
                                        <p className="restaurant-review-summary">
                                            <strong>평균 별점:</strong> {currentRestaurantData.averageRating !== undefined ? currentRestaurantData.averageRating.toFixed(1) : '0'} (리뷰:{currentRestaurantData.reviewCount !== undefined ? currentRestaurantData.reviewCount : '0'}개)
                                        </p>
                                        <ul className="restaurant-review-list">
                                            {currentReviews.map((review) => (
                                                <li key={review.reviewId || `${review.userId}-${review.createdDate}`} className="restaurant-review-item">
                                                    <div className="restaurant-review-header">
                                                        <span className="restaurant-review-author">{review.userId || '알 수 없는 사용자'}</span>
                                                        <span className="restaurant-review-rating">
                                                            {[...Array(5)].map((star, i) => (
                                                                <span key={i} className={`star ${i < review.reviewRating ? 'on' : 'off'}`}>&#9733;</span>
                                                            ))}
                                                        </span>
                                                        <span className="restaurant-review-date">
                                                            {review.createdDate ? new Date(review.createdDate).toLocaleDateString() : '날짜 없음'}
                                                        </span>
                                                        {/* 신고 버튼 클릭 시 handleReportReview에 review 객체 전달 */}
                                                        {user && user.userId !== review.userId && ( // 본인 리뷰가 아닐 경우에만 표시
                                                            <button
                                                                className="restaurant-report-button"
                                                                onClick={() => handleReportReview(review)} // review 객체 전달
                                                            >
                                                                신고
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="restaurant-review-text">{review.reviewContent}</p>
                                                    {review.reviewImagePath && (
                                                        <img
                                                            src={`http://localhost:18090${review.reviewImagePath}`}
                                                            alt="Review"
                                                            className="restaurant-review-image"
                                                            onClick={() => handleImageClick(`http://localhost:18090${review.reviewImagePath}`)}
                                                        />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        {totalPages > 1 && (
                                            <div className="restaurant-pagination-controls">
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => paginate(index + 1)}
                                                        className={`restaurant-page-button ${currentPage === index + 1 ? 'active' : ''}`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p>아직 후기가 없습니다. 첫 후기를 작성해주세요!</p>
                                )}

                                {/* 후기 작성 섹션 */}
                                <div className="restaurant-review-input-section">
                                    <h3>후기 작성하기</h3>
                                    <StarRating rating={reviewRating} setRating={setReviewRating} />
                                    <textarea
                                        className="restaurant-review-textarea"
                                        placeholder="솔직한 후기를 남겨주세요."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                    ></textarea>
                                    <div className="restaurant-review-image-upload">
                                        <label htmlFor="reviewImageUpload" className="restaurant-image-upload-label">
                                            사진 첨부하기
                                        </label>
                                        <input
                                            type="file"
                                            id="reviewImageUpload"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                        {reviewImage && <p className="restaurant-selected-image-name">{reviewImage.name}</p>}
                                    </div>
                                    <div className="restaurant-submit-button-wrapper">
                                        <button
                                            className="restaurant-submit-review-button"
                                            onClick={handleSubmitReview}
                                        >
                                            작성 완료
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="restaurant-reserve-button"
                        onClick={handleReserve}
                    >
                        예약하기
                    </button>
                </div>

                <InfoAlertModal
                    isOpen={isAlertModalOpen}
                    onClose={closeAlertModal}
                    title="안내"
                    message={alertMessage}
                />

                <Reserve
                    isOpen={isReserveModalOpen}
                    onClose={closeReservationModal}
                    title={currentRestaurantData.restaurantName || '예약'}
                    restaurantId={currentRestaurantData.id}
                    availableMenus={currentRestaurantData.menus || []}
                    restaurantLocation={currentRestaurantData.restaurantLocation}
                    zoneName={currentRestaurantData.zoneName}
                />

                {/* 이미지 모달 */}
                {showImageModal && (
                    <div className="image-modal-backdrop" onClick={closeImageModal}>
                        <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                            <img src={selectedImage} alt="Enlarged Review" />
                            <button className="image-modal-close-button" onClick={closeImageModal}>&times;</button>
                        </div>
                    </div>
                )}

                {/* 신고 사유 모달 */}
                <ReportReasonModal
                    isOpen={isReportReasonModalOpen}
                    onClose={() => setIsReportReasonModalOpen(false)}
                    onSubmit={onReportSubmit}
                    reviewId={reviewToReport?.reviewId} // 신고할 리뷰의 ID 전달
                    reviewContent={reviewToReport?.reviewContent} // 신고할 리뷰의 내용 전달 (미리보기용)
                />
            </div>
        </div>
    );
};

export default Restaurant;
