import React, { useEffect, useContext, useRef } from 'react'; // useRef 추가
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';

const KakaoRedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    // useRef를 사용하여 컴포넌트가 리렌더링되어도 값이 유지되는 플래그 생성
    // 이 플래그로 토큰 요청이 한 번만 실행되도록 제어합니다.
    const hasFetchedToken = useRef(false);

    useEffect(() => {
        const fetchKakaoToken = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');

            // 인가 코드가 없거나, 이미 토큰 요청을 보냈다면 함수를 종료합니다.
            if (!code || hasFetchedToken.current) {
                if (!code) {
                    console.error("카카오 인가 코드를 받지 못했습니다. 로그인 실패.");
                    alert("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
                    navigate('/auth/login');
                }
                return;
            }

            // 토큰 요청을 시작하기 전에 플래그를 true로 설정하여 중복 실행 방지
            hasFetchedToken.current = true;

            console.log("카카오로부터 받은 인가 코드:", code);

            try {
                // 백엔드 URL 확인: http://localhost:18090/api/oauth/kakao/callback
                // 이 URL은 카카오 개발자 콘솔에 등록된 Redirect URI와 일치해야 합니다.
                // 백엔드의 kakao.redirect.uri 값도 이 URL과 일치해야 합니다.
                const backendCallbackUrl = 'http://localhost:18090/api/oauth/kakao/callback';
                console.log("백엔드 콜백 URL:", backendCallbackUrl); // 디버깅용

                const response = await axios.post(
                    backendCallbackUrl,
                    { code: code },
                    { withCredentials: true }
                );

                if (response.data && response.data.user && response.data.user.userId) {
                    const loginUser = response.data.user;
                    const serviceToken = response.data.token;

                    setUser(loginUser);
                    sessionStorage.setItem("user", JSON.stringify(loginUser));
                    sessionStorage.setItem("token", serviceToken);

                    console.log("백엔드 카카오 로그인 처리 성공:", loginUser);
                    alert('카카오 로그인에 성공했습니다!');
                    navigate('/'); // 로그인 성공 후 메인 페이지로 이동
                } else {
                    console.error('백엔드 카카오 로그인 처리 실패: 응답 데이터 구조 오류', response.data);
                    alert('카카오 로그인 처리 중 문제가 발생했습니다. 응답 데이터를 확인해주세요.');
                    navigate('/auth/login');
                }
            } catch (error) {
                console.error('카카오 로그인 처리 중 오류 발생:', error);
                if (error.response && error.response.data) {
                    console.error("백엔드 오류 응답:", error.response.data);
                    alert(`카카오 로그인 처리 중 문제가 발생했습니다: ${error.response.data.message || error.response.data.error || '알 수 없는 오류'}`);
                } else {
                    alert('카카오 로그인 처리 중 네트워크 오류가 발생했습니다. 백엔드 서버 상태를 확인해주세요.');
                }
                navigate('/auth/login');
            }
        };

        fetchKakaoToken();
    }, [location, navigate, setUser]); // location이 변경될 때만 다시 실행되도록 의존성 배열 유지

    return (
        <div className="kakao-redirect-container">
            <p>카카오 로그인 처리 중입니다...</p>
        </div>
    );
};

export default KakaoRedirectHandler;
