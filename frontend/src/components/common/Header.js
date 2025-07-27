import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import './Header.css';

// userRole 숫자 값을 실제 역할 문자열로 매핑하는 헬퍼 함수 또는 객체 (매핑 순서 변경)
const getUserRoleString = (roleCode) => {
    switch (roleCode) {
        case 0: return "ROLE_ADMIN";   // 0이 관리자
        case 1: return "ROLE_USER";    // 1이 일반 사용자
        case 2: return "ROLE_OWNER";   // 2가 사장님
        default: return "UNKNOWN_ROLE";
    }
};

const Header = () => {
    const { user, setUser } = useContext(UserContext); // 로그인 상태 전역관리
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null); // 사용자 상태 초기화
        sessionStorage.removeItem("user"); // 세션에서도 제거
        navigate("/"); // 홈으로 이동
    };

    // 사용자의 역할에 따라 특정 링크를 렌더링할지 결정하는 헬퍼 함수
    const renderNavLink = (to, text, allowedRoles) => {
        // user 객체가 없으면 (로그아웃 상태) 바로 null 반환
        if (!user) {
            return null;
        }

        // user.userRole 값을 문자열 역할로 변환
        const currentUserRole = getUserRoleString(user.userRole);

        // allowedRoles가 정의되어 있고, 현재 사용자의 역할이 allowedRoles에 포함되지 않으면 null 반환
        if (allowedRoles && !allowedRoles.includes(currentUserRole)) {
            return null;
        }
        
        // 그 외의 경우 (로그인 상태이고 역할이 허용되거나, allowedRoles가 없는 경우) Link 렌더링
        return <Link to={to}>{text}</Link>;
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <div className="header-left">
                    <img src="/yabab-logo.png" alt="로고" onClick={() => navigate("/")} style={{ cursor: 'pointer'}} />
                </div>

                <nav className="header-center">
                    <Link to="/">홈</Link>
                    <Link to="/feed/main">응원피드</Link>
                    <Link to="/playerPick">선수 추천 맛집</Link>
                    <Link to="/myPage">마이페이지</Link>

                    {/* 사장님 페이지 링크: 'ROLE_OWNER' 또는 'ROLE_ADMIN'만 보이게 */}
                    {renderNavLink("/owner", "사장님페이지", ["ROLE_OWNER"])}
                    
                    {/* 관리자 페이지 링크: 'ROLE_ADMIN'만 보이게 */}
                    {renderNavLink("/admin", "관리자페이지", ["ROLE_ADMIN"])}
                </nav>

                <div className="header-right">
                    {user ? (
                        <>
                            <span>{user.userNickname} 님</span>
                            <button onClick={handleLogout}>로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login">로그인</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};
export default Header;