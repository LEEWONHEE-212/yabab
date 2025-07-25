import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

const KakaoRedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    useEffect(() => {
        const fetchKakaoToken = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');

            if (code) {
                console.log("카카오로부터 받은 인가 코드:", code);
                try {
                    const response = await axios.post(
                        'http://192.168.0.47:18090/api/oauth/kakao/callback', // 백엔드 URL 확인
                        { code: code },
                        { withCredentials: true }
                    );

                    // 백엔드 응답 구조 변경에 따라 데이터 처리 방식 수정
                    // response.data가 { user: KakaoAuthUserVO, token: "..." } 형태인지 확인
                    if (response.data && response.data.user && response.data.user.userId) {
                        const loginUser = response.data.user; // UserLoginResponse에서 'user' 객체를 추출
                        const serviceToken = response.data.token; // 'token'도 추출

                        setUser(loginUser); // UserContext에 KakaoAuthUserVO 객체 저장
                        sessionStorage.setItem("user", JSON.stringify(loginUser)); // 세션 스토리지에 KakaoAuthUserVO 객체 저장
                        sessionStorage.setItem("token", serviceToken); // 토큰도 저장 (필요하다면)

                        console.log("백엔드 카카오 로그인 처리 성공:", loginUser);
                        alert('카카오 로그인에 성공했습니다!');
                        navigate('/'); // 로그인 성공 후 메인 페이지로 이동
                    } else {
                        const errorMessage = response.data.message || "카카오 로그인 처리 실패";
                        alert(errorMessage);
                        console.error('백엔드 카카오 로그인 처리 실패:', response.data);
                        navigate('/auth/login');
                    }
                } catch (error) {
                    console.error('카카오 로그인 처리 중 오류 발생:', error);
                    if (error.response && error.response.data) {
                        console.error("백엔드 오류 응답:", error.response.data);
                        alert(`카카오 로그인 처리 중 문제가 발생했습니다: ${error.response.data.token || '알 수 없는 오류'}`);
                    } else {
                        alert('카카오 로그인 처리 중 문제가 발생했습니다. 백엔드 서버 상태를 확인해주세요.');
                    }
                    navigate('/auth/login');
                }
            } else {
                console.error("카카오 인가 코드를 받지 못했습니다. 로그인 실패.");
                alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
                navigate('/auth/login');
            }
        };

        fetchKakaoToken();
    }, [location, navigate, setUser]);

    return (
        <div className="kakao-redirect-container">
            <p>카카오 로그인 처리 중입니다...</p>
        </div>
    );
};

export default KakaoRedirectHandler;
