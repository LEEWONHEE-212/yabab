import React, {useContext, useState} from "react";
import './LoginForm.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Header from "../common/Header";
import { UserContext } from "../../context/UserContext";

const LoginForm = () => {
    //  로그인 입력 정보 상태로 관리 (아이디, 비밀번호)
    const [formData, setFormData] = useState({
        userId:'',
        userPassword:'',
    });

    //  전역 상태 저장용
    const { setUser } = useContext(UserContext);
    //  페이지 이동을 위한 navigate 함수
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

        try{
            const response = await axios.post(
                'http://localhost:18090/auth/login',
                formData,
                {withCredentials: true}     //  쿠키 기반 세션 전달 허용
            );

            if (response.data.success) {
                //  전역 상태와 세션에 사용자 정보 저장
                const loginUser = response.data.user    //  서버에서 보내준 userVO 객체
                setUser(loginUser);     //  UserContext에 저장
                sessionStorage.setItem("user", JSON.stringify(loginUser));     //  새로고침에도 유지

                 // ✅ 디버깅용 로그
            console.log("로그인한 사용자 정보:", loginUser);
            console.log("Context 상태 확인:", loginUser);  // 여기선 user보다 loginUser 출력이 정확함
            
                alert("로그인 성공");
                navigate('/');  //  홈 페이지로 이동
            } else {
                alert(response.data.message || "로그인 실패");
            }
        } catch (error) {
            console.error("로그인 요청 중 오류 발생", error);
            alert("서버와의 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <Header />
            {/* 로그인 화면 본문 */}
            <main className="container">
                <aside className="sidebar">
                    <span className="active">로그인</span>
                    <a href="#">회원가입</a>
                    <a href="#">아이디 찾기</a>
                    <a href="#">비밀번호 찾기</a>
                </aside>

                <section className="login-form">
                    <h2>로그인</h2>
                    <form onSubmit={handleSubmit}>
                        {/* 아이디 입력 */}
                        <div className="input-group">
                            <label htmlFor="userId">아이디</label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                placeholder="아이디를 입력해주세요"
                                value={formData.userId}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 비밀번호 입력 */}
                        <div className="input-group">
                            <label htmlFor="userPassword">비밀번호</label>
                            <input
                                type="password"
                                id="userPassword"
                                name="userPassword"
                                placeholder="비밀번호를 입력해주세요"
                                value={formData.userPassword}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 로그인 버튼 */}
                        <button type="submit" className="submit-btn">로그인</button>

                        {/* 카카오 로그인 버튼 */}
                        <button type="button" className="kakao-submit-btn">카카오로 로그인</button>

                        {/* 회원가입 및 계정 찾기 링크 */}
                        <div className="login-extra">
                            <p>yabab 회원이 아니세요? <a href="#">회원가입</a></p>
                            <p>
                                <a href="#">아이디 찾기</a> &nbsp; | &nbsp;
                                <a href="#">비밀번호 찾기</a>
                            </p>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};
export default LoginForm;