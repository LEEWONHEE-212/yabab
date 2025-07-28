import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPage.css';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';
import EditProfilePage from './EditProfilePage';
import Footer from '../common/Footer';

// 사용자 정보를 표시하는 서브 컴포넌트
function UserInfoDisplay({ user, onEditClick }) {
    console.log("UserInfoDisplay 컴포넌트 - 현재 user 객체 확인 (모든 속성):", user);

    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    useEffect(() => {
        setImageLoadFailed(false);
    }, [user.userImagePath, user.userImageName]);

    if (!user) {
        return (
            <div className="mypage-user-info-section">
                <div className="mypage-user-image-placeholder">사용자 정보를 불러오는 중...</div>
                <div className="mypage-user-details-placeholder">
                    <div>사용자 정보를 불러오는 중입니다.</div>
                </div>
            </div>
        );
    }

    const nickname = user.userNickname || '닉네임 정보 없음';
    const name = user.userName || '이름 정보 없음';
    const team = user.userFavoriteTeam || '응원하는 팀 정보 없음';
    const email = user.userEmail || '이메일 정보 없음';
    const phoneNumber = user.userPhone || '전화번호 정보 없음';

    // ⭐ 이미지 URL 구성 로직 수정 시작 ⭐
    let profileImageUrl = 'https://via.placeholder.com/150?text=No+Image'; // 기본 이미지 설정

    if (user.userImagePath && user.userImageName) {
        let imagePath = user.userImagePath;

        // 기존 '/profile_images/' 경로를 '/uploads/'로 변환
        if (imagePath === '/profile_images/') {
            imagePath = '/uploads/';
        }

        profileImageUrl = `http://localhost:18090${imagePath}${user.userImageName}`;
    }

    // 이미지 로드 실패 시 대체 이미지 사용
    const finalProfileImageSrc = imageLoadFailed
        ? 'https://via.placeholder.com/150?text=Load+Error'
        : profileImageUrl;
    // ⭐ 이미지 URL 구성 로직 수정 끝 ⭐

    return (
        <div className="mypage-user-info-section">
            <div className="mypage-profile-container">
                <div className="mypage-user-image">
                    <img
                        src={finalProfileImageSrc} // 수정된 URL 사용
                        onError={(e) => {
                            if (!imageLoadFailed) {
                                e.target.onerror = null;
                                setImageLoadFailed(true);
                                console.error("프로필 이미지 로드 실패:", user.userImagePath, user.userImageName);
                            }
                        }}
                    />
                </div>
                <button className="mypage-edit-profile-btn" onClick={onEditClick}>수정</button>
            </div>

            <div className="mypage-user-details-text">
                <div>닉네임: <span id="nickname">{nickname}</span></div>
                <div>이름: <span id="username">{name}</span></div>
                <div>응원하는 팀: <span id="team">{team}</span></div>
                <div>이메일: <span id="email">{email}</span></div>
                <div>전화번호: <span id="phoneNumber">{phoneNumber}</span></div>
            </div>
        </div>
    );
}

// 탭 메뉴를 표시하는 서브 컴포넌트
function TabSection({ activeTab, onTabChange }) {
    return (
        <div className="mypage-tabs">
            <button
                className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => onTabChange('reservations')}
            >
                예약 내역
            </button>
            <button
                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => onTabChange('reviews')}
            >
                작성 리뷰
            </button>
            <button
                className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => onTabChange('posts')}
            >
                작성 게시글
            </button>
        </div>
    );
}

// 예약 내역 리스트를 표시하는 서브 컴포넌트 (삭제 버튼 추가)
function MyReservations({ data, onDeleteReservation }) { // onDeleteReservation prop 추가
    const deleteButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9em',
        marginTop: '10px',
        transition: 'background-color 0.2s ease',
    };

    const deleteButtonHoverStyle = {
        backgroundColor: '#c82333',
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="mypage-tab-pane">
            <h2 className="section-title">예약 내역</h2>
            <div className="mypage-list-container">
                {data.length === 0 ? (
                    <p>예약 내역이 없습니다.</p>
                ) : (
                    <ul className="mypage-list">
                        {data.map((reservation) => (
                            <li key={reservation.reservationId} className="mypage-list-item">
                                <strong>{reservation.restaurantName || '식당명 알 수 없음'}</strong>
                                {reservation.menuItems && reservation.menuItems.length > 0 ? (
                                    <div className="mypage-menu-items">
                                        {reservation.menuItems.map((item, index) => (
                                            <p key={index}>
                                                메뉴: {item.menuName || '메뉴명 알 수 없음'}, 갯수: <span style={{ fontWeight: 'bold' }}>{item.quantity || 0}</span>개
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p>주문 메뉴 정보 없음</p>
                                )}
                                <p>예약 현황: {reservation.status || '상태 알 수 없음'}</p>
                                <button
                                    style={isHovered ? { ...deleteButtonStyle, ...deleteButtonHoverStyle } : deleteButtonStyle}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={() => onDeleteReservation(reservation.reservationId)} // 삭제 버튼
                                >
                                    예약 취소
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// 작성 리뷰 리스트를 표시하는 서브 컴포넌트 (삭제 버튼 추가)
function MyReviews({ data, onDeleteReview }) { // onDeleteReview prop 추가
    const deleteButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9em',
        marginTop: '10px',
        transition: 'background-color 0.2s ease',
    };

    const deleteButtonHoverStyle = {
        backgroundColor: '#c82333',
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="mypage-tab-pane">
            <h2 className="section-title">작성 리뷰</h2>
            <div className="mypage-list-container">
                {data.length === 0 ? (
                    <p>작성된 리뷰가 없습니다.</p>
                ) : (
                    <ul className="mypage-list">
                        {data.map((review) => (
                            <li key={review.reviewId} className="mypage-list-item">
                                <strong>{review.restaurantName || '식당명 알 수 없음'}</strong>
                                <p>내용: {review.content || '내용 없음'}</p>
                                <p>별점: {review.rating || '별점 없음'} / 5</p>
                                <button
                                    style={isHovered ? { ...deleteButtonStyle, ...deleteButtonHoverStyle } : deleteButtonStyle}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={() => onDeleteReview(review.reviewId)} // 삭제 버튼
                                >
                                    리뷰 삭제
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// 작성 게시글 리스트를 표시하는 서브 컴포넌트
function MyPosts({ data, onDeletePost }) {
    const deleteButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '0.9em',
        marginTop: '10px',
        transition: 'background-color 0.2s ease',
    };

    const deleteButtonHoverStyle = {
        backgroundColor: '#c82333',
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="mypage-tab-pane">
            <h2 className="section-title">작성 게시글</h2>
            <div className="mypage-list-container">
                {data.length === 0 ? (
                    <p>작성된 게시글이 없습니다.</p>
                ) : (
                    <ul className="mypage-list">
                        {data.map((post) => (
                            <li key={post.feedId} className="mypage-list-item">
                                <strong>{post.feedTitle || '제목 없음'}</strong>
                                <p>내용: {post.feedContent || '내용 없음'}</p>
                                <p>
                                    작성일: {new Date(post.createdDate).toLocaleDateString() || '날짜 없음'} -
                                    조회수: {post.feedViews || 0} -
                                    댓글: {post.feedCommentCount || 0}
                                </p>
                                <button
                                    style={isHovered ? { ...deleteButtonStyle, ...deleteButtonHoverStyle } : deleteButtonStyle}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    onClick={() => onDeletePost(post.feedId)}
                                >
                                    삭제
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}


// MyPage 메인 컴포넌트
function MyPage() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState('reservations');
    const [reservationsData, setReservationsData] = useState([]);
    const [reviewsData, setReviewsData] = useState([]);
    const [postsData, setPostsData] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 모든 마이페이지 데이터를 불러오는 함수
    const fetchMyPageData = useCallback(async (userId) => {
        setLoadingData(true);
        try {
            const reservationsResponse = await axios.get(`http://localhost:18090/api/mypage/${userId}/reservations`);
            setReservationsData(reservationsResponse.data);
            console.log("예약 내역:", reservationsResponse.data);

            const reviewsResponse = await axios.get(`http://localhost:18090/api/mypage/${userId}/reviews`);
            setReviewsData(reviewsResponse.data);
            console.log("작성 리뷰:", reviewsResponse.data);

            const postsResponse = await axios.get(`http://localhost:18090/api/mypage/${userId}/posts`);
            setPostsData(postsResponse.data);
            console.log("작성 게시글:", postsResponse.data);

        } catch (error) {
            console.error("마이페이지 데이터 로드 실패:", error);
            setReservationsData([]);
            setReviewsData([]);
            setPostsData([]);
        } finally {
            setLoadingData(false);
        }
    }, []);

    // 예약 삭제 핸들러 추가
    const handleDeleteReservation = useCallback(async (reservationId) => {
        if (!user || !user.userId) {
            alert("로그인이 필요합니다.");
            navigate('/auth/login');
            return;
        }

        if (window.confirm("정말로 이 예약을 취소하시겠습니까?")) {
            try {
                const response = await axios.delete(`http://localhost:18090/api/mypage/${user.userId}/reservations/${reservationId}`);
                console.log(response.data);
                alert(response.data);
                fetchMyPageData(user.userId); // 삭제 후 목록 새로고침
            } catch (error) {
                console.error("예약 취소 실패:", error);
                alert(`예약 취소 실패: ${error.response ? error.response.data : error.message}`);
            }
        }
    }, [user, navigate, fetchMyPageData]);

    // 리뷰 삭제 핸들러 추가
    const handleDeleteReview = useCallback(async (reviewId) => {
        if (!user || !user.userId) {
            alert("로그인이 필요합니다.");
            navigate('/auth/login');
            return;
        }

        if (window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(`http://localhost:18090/api/mypage/${user.userId}/reviews/${reviewId}`);
                console.log(response.data);
                alert(response.data);
                fetchMyPageData(user.userId); // 삭제 후 목록 새로고침
            } catch (error) {
                console.error("리뷰 삭제 실패:", error);
                alert(`리뷰 삭제 실패: ${error.response ? error.response.data : error.message}`);
            }
        }
    }, [user, navigate, fetchMyPageData]);

    // 게시글 삭제 핸들러 (기존 코드 유지)
    const handleDeletePost = useCallback(async (feedId) => {
        if (!user || !user.userId) {
            alert("로그인이 필요합니다.");
            navigate('/auth/login');
            return;
        }

        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(`http://localhost:18090/api/mypage/${user.userId}/posts/${feedId}`);
                console.log(response.data);
                alert(response.data);
                fetchMyPageData(user.userId);
            } catch (error) {
                console.error("게시글 삭제 실패:", error);
                alert(`게시글 삭제 실패: ${error.response ? error.response.data : error.message}`);
            }
        }
    }, [user, navigate, fetchMyPageData]);


    useEffect(() => {
        if (!user || Object.keys(user).length === 0) {
            alert("로그인이 필요합니다.");
            navigate('/auth/login');
            return;
        }

        if (user.userId) {
            fetchMyPageData(user.userId);
        } else {
            console.warn("User ID가 UserContext에 없습니다. 마이페이지 데이터를 가져올 수 없습니다.");
            setLoadingData(false);
        }

    }, [user, navigate, fetchMyPageData]);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const handleEditProfile = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        // 프로필 수정 후 데이터 새로고침 (업데이트된 사용자 정보 반영)
        if (user && user.userId) {
            fetchMyPageData(user.userId);
        }
    };

    const handleLogout = () => {
        setUser(null);
        sessionStorage.removeItem("user");
        alert("로그아웃 되었습니다.");
        navigate('/auth/login');
    };

    if (!user || Object.keys(user).length === 0) {
        return <div className="loading">로그인 정보 확인 중...</div>;
    }

    return (
        <>
            <Header onLogout={handleLogout} />
            <div className="mypage-container">
                <h1>마이페이지</h1>

                <UserInfoDisplay user={user} onEditClick={handleEditProfile} />

                <TabSection activeTab={activeTab} onTabChange={handleTabChange} />

                <div className="mypage-tab-content">
                    {loadingData ? (
                        <div className="loading">데이터 로딩 중...</div>
                    ) : (
                        <>
                            {activeTab === 'reservations' && <MyReservations data={reservationsData} onDeleteReservation={handleDeleteReservation} />}
                            {activeTab === 'reviews' && <MyReviews data={reviewsData} onDeleteReview={handleDeleteReview} />}
                            {activeTab === 'posts' && <MyPosts data={postsData} onDeletePost={handleDeletePost} />}
                        </>
                    )}
                </div>
            </div>

            <EditProfilePage isOpen={isEditModalOpen} onClose={handleCloseEditModal} />
            <Footer/>
        </>
    );
}

export default MyPage;
