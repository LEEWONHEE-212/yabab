// src/pages/Admin/AdminPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header'; // Header component path, adjust as per your project.
import { UserContext } from '../../context/UserContext'; // UserContext path, adjust as per your project.

// Import components for each tab in the admin page.
// These components might not exist yet, but are imported here for future use.
import UserManagement from './UserManagement';
import ReviewReportList from './ReviewReportList';
import PostReportList from './PostReportList';

// Admin page specific stylesheet
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext); // Get user info and update function.

    const [activeTab, setActiveTab] = useState('users'); // Default active tab is 'User Management'
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null); // Authorization error message

    // Check admin privileges on component mount
    useEffect(() => {
        if (!user) {
            // If no user info, redirect to login page
            setAuthError("로그인이 필요합니다.");
            setTimeout(() => navigate('/auth/login'), 2000); // Redirect after 2 seconds
            return;
        }

        // Assuming userRole 0 is 'Admin'.
        // You might need to change the number according to your project's userRole definition.
        if (user.userRole !== 0) { // Assuming 0: Admin, 1: Owner, 2: General User, etc.
            setAuthError("관리자 권한이 없습니다. 이 페이지에 접근할 수 없습니다.");
            setTimeout(() => navigate('/'), 2000); // Redirect to home page after 2 seconds
            return;
        }

        setLoading(false); // Authorization check complete
    }, [user, navigate, setUser]); // Re-run useEffect when user, navigate, or setUser changes

    // UI when loading or authorization error occurs
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
                {/* Link to login or home */}
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
            <Header /> {/* Common header component */}
            <div className="admin-page-container">
                {/* Changed class name from "section-title main-title" to "admin-page-main-title" */}
                <h1 className="admin-page-main-title">관리자 페이지</h1>

                <div className="admin-tabs-container">
                    <button
                        // Changed class name from "tab-button" to "admin-page-tab-button"
                        className={`admin-page-tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        회원 관리
                    </button>
                    <button
                        // Changed class name from "tab-button" to "admin-page-tab-button"
                        className={`admin-page-tab-button ${activeTab === 'reviewReports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviewReports')}
                    >
                        리뷰 신고 목록
                    </button>
                    <button
                        // Changed class name from "tab-button" to "admin-page-tab-button"
                        className={`admin-page-tab-button ${activeTab === 'postReports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('postReports')}
                    >
                        게시물 신고 목록
                    </button>
                </div>

                {/* Class name "admin-content-area" was already correct */}
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
