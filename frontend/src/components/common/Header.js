import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import './Header.css';

const Header = () => {
    const { user, setUser } = useContext(UserContext);  //  로그인 상태 전역관리
    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null);  //  사용자 상태 초기화
        sessionStorage.removeItem("user");  //  세션에서도 제거
        navigate("/")   //  홈으로 이동
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <div className="header-left">
                    <img src="/yabab-logo.png" alt="로고" onClick={() => navigate("/")} style={{ cursor: 'pointer'}} />
                </div>

                <nav className="header-center">
                    <Link to="/">홈</Link>
                    <Link to="/feed/:teamId/list">응원피드</Link>
                    <Link to="/">선수 추천 맛집</Link>
                    <Link to="/myPage">마이페이지</Link>
                    <Link to="/owner">사장님페이지</Link>
                    <Link to="/admin">관리자페이지</Link>
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