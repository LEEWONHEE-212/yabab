import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyPage.css';
import Header from '../common/Header';
import { UserContext } from '../../context/UserContext';
import EditProfilePage from './EditProfilePage';

// 사용자 정보를 표시하는 서브 컴포넌트 (변경 없음)
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
    const team = user.userFavoriteTeam || '';
    const email = user.userEmail || '이메일 정보 없음';
    const phoneNumber = user.userPhone || '전화번호 정보 없음';

    const profileImageSrc = imageLoadFailed
        ? 'https://via.placeholder.com/150?text=Load+Error'
        : (user.userImagePath && user.userImageName
            ? `http://localhost:18090${user.userImagePath}${user.userImageName}`
            : 'https://via.placeholder.com/150?text=No+Image');

    return (
        <div className="mypage-user-info-section">
            <div className="mypage-profile-container">
                <div className="mypage-user-image">
                    <img
                        src={profileImageSrc}
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

// 탭 메뉴를 표시하는 서브 컴포넌트 (변경 없음)
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
            {/* 게시글 탭은 지금 사용하지 않으므로 제거하거나 주석 처리합니다. */}
            {/*
            <button
                className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => onTabChange('posts')}
            >
                작성 게시글
            </button>
            */}
        </div>
    );
}

// 예약 내역 리스트를 표시하는 서브 컴포넌트 - 수정됨
function MyReservations({ data }) {
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
                                {/* menuItems가 배열로 오고, 각 항목에 menuName과 count가 있다고 가정 */}
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// 작성 리뷰 리스트를 표시하는 서브 컴포넌트 - 수정됨
function MyReviews({ data }) {
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
                                <p>내용: {review.content || '내용 없음'}</p> {/* review.reviewContent -> review.content로 변경 */}
                                <p>별점: {review.rating || '별점 없음'} / 5</p> {/* review.rating 필드 사용 */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// 작성 게시글 리스트를 표시하는 서브 컴포넌트 (더 이상 사용되지 않으므로 제거하거나 주석 처리합니다.)
/*
function MyPosts({ data }) {
    return (
        <div className="mypage-tab-pane">
            <h2 className="section-title">작성 게시글</h2>
            <div className="mypage-list-container">
                {data.length === 0 ? (
                    <p>작성된 게시글이 없습니다.</p>
                ) : (
                    <ul className="mypage-list">
                        {data.map((post) => (
                            <li key={post.postId} className="mypage-list-item">
                                <strong>{post.postTitle}</strong>
                                <p>{new Date(post.postDate).toLocaleDateString()} - 조회수: {post.postViews} - 댓글: {post.postComments}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
*/

// MyPage 메인 컴포넌트 (변경 없음)
function MyPage() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    const [activeTab, setActiveTab] = useState('reservations');
    const [reservationsData, setReservationsData] = useState([]);
    const [reviewsData, setReviewsData] = useState([]);
    const [postsData, setPostsData] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchMyPageData = useCallback(async (userId) => {
        setLoadingData(true);
        try {
            const reservationsResponse = await axios.get(`http://localhost:18090/api/mypage/${userId}/reservations`);
            setReservationsData(reservationsResponse.data);
            console.log("예약 내역:", reservationsResponse.data);

            const reviewsResponse = await axios.get(`http://localhost:18090/api/mypage/${userId}/reviews`);
            setReviewsData(reviewsResponse.data);
            console.log("작성 리뷰:", reviewsResponse.data);

        } catch (error) {
            console.error("마이페이지 데이터 로드 실패:", error);
            alert("마이페이지 데이터를 불러오는데 실패했습니다. 서버 상태를 확인해주세요.");
            setReservationsData([]);
            setReviewsData([]);
            setPostsData([]);
        } finally {
            setLoadingData(false);
        }
    }, []);

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
                            {activeTab === 'reservations' && <MyReservations data={reservationsData} />}
                            {activeTab === 'reviews' && <MyReviews data={reviewsData} />}
                            {/* 게시글 탭은 지금 사용하지 않으므로 제거합니다. */}
                            {/* {activeTab === 'posts' && <MyPosts data={postsData} />} */}
                        </>
                    )}
                </div>
            </div>

            <EditProfilePage isOpen={isEditModalOpen} onClose={handleCloseEditModal} />
        </>
    );
}

export default MyPage;