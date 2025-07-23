import React, { useState, useEffect, useContext } from 'react'; // useContext 추가
import './Restaurant.css';
import InfoAlertModal from './InfoAlertModal';
import Reserve from './Reserve';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext'; // UserContext 임포트

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
    // 초기값은 prop으로 받은 restaurant로 설정
    const [currentRestaurantData, setCurrentRestaurantData] = useState(restaurant);

    // 이미지 모달 관련 상태 추가
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(''); // 크게 볼 이미지 URL

    // useAuth 훅 대신 UserContext에서 사용자 정보 가져오기
    const { user, isLoading } = useContext(UserContext); // UserContext 사용
    const isLoggedIn = !!user; // user 객체가 있으면 로그인 상태로 간주

    const navigate = useNavigate();

    // 모달이 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (isAlertModalOpen || isReserveModalOpen || showImageModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAlertModalOpen, isReserveModalOpen, showImageModal]);

    // 식당 상세 정보를 다시 불러오는 함수 (API 경로 수정)
    const fetchRestaurantDetails = async (restaurantId) => {
        if (!restaurantId) {
            console.warn("restaurantId is undefined, cannot fetch details.");
            return;
        }
        try {
            // API 호출 시 메뉴 데이터도 함께 받아와야 합니다.
            // 현재 엔드포인트가 'api/Reviews/{restaurantId}'이므로,
            // 이 API 응답에 식당 정보, 리뷰, 그리고 메뉴 정보가 모두 포함되어 있다고 가정합니다.
            const response = await fetch(`http://localhost:18090/api/Reviews/${restaurantId}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched restaurant details:", data);
                setCurrentRestaurantData(data); // ✨ 여기에서 메뉴 데이터를 포함한 전체 식당 데이터를 업데이트합니다.
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch restaurant details.', response.status, response.statusText, errorText);
            }
        } catch (error) {
            console.error('Error fetching restaurant details:', error);
        }
    };

    // 컴포넌트 마운트 시 (또는 restaurant prop 변경 시) 초기 데이터 로드
    useEffect(() => {
        if (restaurant && restaurant.id) {
            fetchRestaurantDetails(restaurant.id);
        }
    }, [restaurant]);

    // 로딩 중이거나 데이터가 아직 완전히 로드되지 않았다면 null 반환
    // currentRestaurantData.menus가 비어있을 수도 있으므로 로딩 조건에서 제외
    if (isLoading || !currentRestaurantData || !currentRestaurantData.restaurantName) {
        // isLoading은 UserContext에서 오는 상태입니다.
        // 현재는 UserContext에 isLoading이 없는 것으로 보입니다.
        // UserContext가 user 정보를 동기적으로 제공한다면 isLoading은 필요 없거나,
        // UserContext 내부에서 비동기 로딩을 관리한다면 해당 로딩 상태를 여기에 반영해야 합니다.
        // 일단 현재 코드에서 isLoading이 정의되지 않았으므로 제거하거나 UserContext에서 제공하는지 확인하세요.
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

        // user 객체와 user.userId가 UserContext에서 올바르게 제공되는지 확인
        if (!user || !user.userId) { // user.id 대신 user.userId 사용 (UserContext의 명명 규칙에 따름)
            alert('사용자 정보를 가져올 수 없습니다. 다시 로그인해 주세요.');
            console.error('User ID is missing from UserContext. User object:', user);
            return;
        }

        const formData = new FormData();

        const reviewPayload = {
            userId: user.userId, // UserContext에서 가져온 userId 사용
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
                                <p className="restaurant-info-detail-text"><strong>구역:</strong> {currentRestaurantData.restaurantLocation || '정보 없음'}</p> {/* Changed zoneName to restaurantLocation based on the JSON structure */}
                                <p className="restaurant-info-detail-text"><strong>상세 구역:</strong> {currentRestaurantData.zoneName || '정보 없음'}</p> {/* Changed restaurantLocation to zoneName based on the JSON structure */}
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
                                        {currentRestaurantData.menus.map((item) => (
                                            <li key={item.menuId} className="restaurant-menu-item">
                                                <span className="restaurant-menu-item-name">{item.menuName}</span>
                                                <span className="restaurant-menu-item-price">{item.menuPrice?.toLocaleString()}원</span>
                                            </li>
                                        ))}
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
                    // ✨ 여기에서 currentRestaurantData.menus를 Reserve 컴포넌트에 prop으로 전달합니다.
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
            </div>
        </div>
    );
};

export default Restaurant;