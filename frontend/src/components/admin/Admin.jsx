// src/pages/Admin/AdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header'; // Header 컴포넌트 경로를 프로젝트에 맞게 조정해주세요.
import { UserContext } from '../../context/UserContext'; // UserContext 경로를 프로젝트에 맞게 조정해주세요.

// 관리자 페이지의 각 탭별 내용을 담을 컴포넌트들을 import 합니다.
// 이 컴포넌트들은 아직 생성되지 않았을 수 있으나, AdminPage.jsx에서는 미리 import 합니다.
import UserManagement from './UserManagement';
import ReviewReportList from './ReviewReportList';
import PostReportList from './PostReportList';

// 관리자 페이지 전용 스타일 시트
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext); // 사용자 정보와 업데이트 함수를 가져옵니다.

    const [activeTab, setActiveTab] = useState('users'); // 기본 활성 탭은 '회원 관리'
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null); // 권한 관련 에러 메시지

    // 컴포넌트 마운트 시 관리자 권한 확인
    useEffect(() => {
        if (!user) {
            // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
            setAuthError("로그인이 필요합니다.");
            setTimeout(() => navigate('/auth/login'), 2000); // 2초 후 리다이렉트
            return;
        }

        // userRole 1이 '관리자'라고 가정합니다.
        // 실제 프로젝트의 userRole 정의에 따라 숫자를 변경해야 합니다.
        if (user.userRole !== 0) { // 0: 관리자, 1: 사장님, 2: 일반 사용자 등으로 가정
            setAuthError("관리자 권한이 없습니다. 이 페이지에 접근할 수 없습니다.");
            setTimeout(() => navigate('/'), 2000); // 2초 후 홈 페이지로 리다이렉트
            return;
        }

        setLoading(false); // 권한 확인 완료
    }, [user, navigate, setUser]); // user, navigate, setUser가 변경될 때마다 useEffect 재실행

    // 로딩 중이거나 권한 에러가 발생했을 때의 UI
    if (loading) {
        return (
            <div className="admin-page-container loading">
                <p>관리자 권한을 확인 중입니다. 잠시만 기다려 주세요...</p>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="admin-page-container error-state">
                <p className="error-message">{authError}</p>
                {/* 로그인 또는 홈으로 돌아가는 링크 */}
                {!user ? (
                    <Link to="/auth/login" className="home-link">로그인 페이지로 이동</Link>
                ) : (
                    <Link to="/" className="home-link">홈으로 돌아가기</Link>
                )}
            </div>
        );
    }

    return (
        <>
            <Header /> {/* 공통 헤더 컴포넌트 */}
            <div className="admin-page-container">
                <h1 className="section-title main-title">관리자 페이지</h1>

                <div className="admin-tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        회원 관리
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'reviewReports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviewReports')}
                    >
                        리뷰 신고 목록
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'postReports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('postReports')}
                    >
                        게시물 신고 목록
                    </button>
                </div>

                <div className="admin-content-area">
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'reviewReports' && <ReviewReportList />}
                    {activeTab === 'postReports' && <PostReportList />}
                </div>
            </div>
        </>
    );
};

export default Admin;