// src/pages/MyPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate
import './MyPage.css'; // MyPage 전용 CSS 또는 모듈 CSS

// 하위 컴포넌트들을 이 파일 안에 직접 정의하거나, components 폴더에 분리해도 됩니다.
// 시간 절약을 위해 이 파일 안에 간단하게 정의하는 것을 권장합니다.

// --- UserInfoDisplay 컴포넌트 (MyPage 내부용) ---
function UserInfoDisplay({ user, onEditClick }) {
    return (
        <div className="mypage-user-info">
            <div className="mypage-user-image">
                {user.profileImage ? <img src={user.profileImage} alt="프로필 이미지" /> : '이미지'}
            </div>
            <div className="mypage-user-details">
                <div>닉네임: <span id="nickname">{user.nickname}</span></div>
                <div className="mypage-name-row">
                    <strong><span id="username">{user.name}</span></strong>
                    <button className="mypage-edit-button" onClick={onEditClick}>수정</button>
                </div>
                <div>응원하는 팀: <span id="team">{user.team}</span></div>
            </div>
        </div>
    );
}

// --- TabSection 컴포넌트 (MyPage 내부용) ---
function TabSection({ activeTab, onTabChange }) {
    return (
        <div className="mypage-tabs">
            <button
                className={`mypage-tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
                onClick={() => onTabChange('reservations')}
            >
                내 예약현황
            </button>
            <button
                className={`mypage-tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => onTabChange('reviews')}
            >
                내가 쓴 리뷰
            </button>
            <button
                className={`mypage-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => onTabChange('posts')}
            >
                내가 쓴 게시물
            </button>
        </div>
    );
}

// --- MyReservations 컴포넌트 (MyPage 내부용) ---
function MyReservations({ data }) {
    return (
        <div className="mypage-tab-pane">
            <h3>내 예약현황</h3>
            {data.length > 0 ? (
                data.map(reservation => (
                    <div key={reservation.id} className="mypage-item">
                        <h4>{reservation.type} 예약</h4>
                        <p>일시: {reservation.date}</p>
                        <p>장소: {reservation.location}</p>
                        <p>상태: {reservation.status}</p>
                    </div>
                ))
            ) : (
                <p>현재 예약 현황이 없습니다.</p>
            )}
        </div>
    );
}

// --- MyReviews 컴포넌트 (MyPage 내부용) ---
function MyReviews({ data }) {
    return (
        <div className="mypage-tab-pane">
            <h3>내가 쓴 리뷰</h3>
            {data.length > 0 ? (
                data.map(review => (
                    <div key={review.id} className="mypage-item review-item">
                        <div className="mypage-review-header">
                            <div className="mypage-profile-icon">{review.author.charAt(0)}</div>
                            <span className="mypage-user-name">{review.author}</span>
                            <span className="mypage-time">{review.time}</span>
                        </div>
                        <div className="mypage-review-content">
                            <p>{review.content}</p>
                        </div>
                        <div className="mypage-interaction-area">
                            <span>❤️ {review.likes}</span>
                            <span>💬 {review.comments}</span>
                        </div>
                    </div>
                ))
            ) : (
                <p>작성된 리뷰가 없습니다.</p>
            )}
        </div>
    );
}

// --- MyPosts 컴포넌트 (MyPage 내부용) ---
function MyPosts({ data }) {
    return (
        <div className="mypage-tab-pane">
            <h3>내가 쓴 게시물</h3>
            {data.length > 0 ? (
                data.map(post => (
                    <div key={post.id} className="mypage-item post-item">
                        <h4>{post.title}</h4>
                        <p>작성일: {post.date}</p>
                        <p>조회수: {post.views}, 댓글: {post.comments}</p>
                    </div>
                ))
            ) : (
                <p>작성된 게시물이 없습니다.</p>
            )}
        </div>
    );
}


// --- MyPage 메인 컴포넌트 ---
function MyPage() {
    const navigate = useNavigate(); // 페이지 이동 훅
    const [activeTab, setActiveTab] = useState('reservations');
    const [userData, setUserData] = useState(null);
    const [reservationsData, setReservationsData] = useState([]);
    const [reviewsData, setReviewsData] = useState([]);
    const [postsData, setPostsData] = useState([]);

    useEffect(() => {
        // 실제로는 API 호출로 사용자 정보 및 각 탭의 데이터를 가져옵니다.
        // 현재는 더미 데이터를 사용합니다.
        setUserData({
            nickname: '사용자닉네임',
            name: '성 이 름',
            team: 'NC다이노스',
            profileImage: '' // 이미지 파일명이나 URL
        });

        setReservationsData([
            { id: 1, type: '경기 티켓', date: '2025년 8월 10일 오후 6시 30분', location: '창원 NC 파크', status: '확정' },
            // ...
        ]);
        setReviewsData([
            { id: 101, author: '성 이 름', time: '9시간 전', content: '야구장 근처 편의점 아는 사람 있음? 체인 말고 진짜 좀 숨은 집 좀 알려줘봐...', likes: 51, comments: 5 },
            // ...
        ]);
        setPostsData([
            { id: 201, title: '주말 경기 관람 후기', date: '2025.07.20', views: 123, comments: 15 },
            // ...
        ]);
    }, []);

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
    };

    const handleEditProfile = () => {
        navigate('/mypage/edit'); // 내 정보 수정 페이지로 이동
    };

    if (!userData) {
        return <div className="loading">로딩 중...</div>;
    }

    return (
        <div className="mypage-container">
            <h1>마이페이지</h1>
            <UserInfoDisplay user={userData} onEditClick={handleEditProfile} />

            <TabSection activeTab={activeTab} onTabChange={handleTabChange} />

            <div className="mypage-tab-content">
                {activeTab === 'reservations' && <MyReservations data={reservationsData} />}
                {activeTab === 'reviews' && <MyReviews data={reviewsData} />}
                {activeTab === 'posts' && <MyPosts data={postsData} />}
            </div>
        </div>
    );
}

export default MyPage;