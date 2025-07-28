import React, { useState } from "react";
import axios from "axios";
import './FindPwdForm.css';
import Header from "../common/Header";
import { Link, useNavigate } from "react-router-dom";

const FindPwdForm = () => {
    //  백엔드로 보낼 정보만 포함
    const [formData, setFormData] = useState({
        userId:'',
        userEmail:'',
        userPassword:'',
    });

    //  프론트에서만 사용하는 입력값
    const [emailCode, setEmailCode] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailVerified, setEmailverified] = useState(false);
    const [showModal, setShowModal] = useState(false);  //  모달 제어

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    //  인증번호 전송
    const sendAuthCode = async() => {
        if(!formData.userEmail.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }

        try{
            const response = await axios.post(
                'http://localhost:18090/auth/sendAuthCode',
                null,   //  바디 없음
                {params: {email: formData.userEmail}}
            );

            const{result, message} = response.data;
            alert(message);
        } catch (error) {
            console.error("이메일 인증 요청 오류", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    //  인증번호 확인 요청
    const handleVerifyAuthCode = async () => {
        try {
            const response = await axios.post(
                'http://localhost:18090/auth/verifyAuthCode',
                {
                    email: formData.userEmail,
                    authCode: emailCode,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if(response.data.verified) {
                alert(response.data.message);
                setEmailverified(true);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("인증번호 확인 에러", error);
            alert ("인증번호 확인 중 오류가 발생했습니다.");
        }
    };

    //  비밀번호 재설정 요청
    const handleResetPassword = async(e) => {
        e.preventDefault();

        if(!emailVerified) {
            alert("이메일 인증을 완료해주세요.")
            return;
        }

        if(formData.userPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:18090/auth/reset-password',
                formData
            );

            if(response.data.success) {
                setShowModal(true); //  모달 표시
            } else {
                alert(response.data.message || "변경 실패");
            }
        } catch (error) {
            console.error("비밀번호 재설정 오류", error);
            alert("서버 통신 중 오류 발생")
        }
    };

    //  모달 닫고 페이지 이동
    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/auth/login');
    }

    //  비밀번호 확인 input의 값이 바뀔 때 호출
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    return(
        <div>
            <Header />
            <main className="container">
                <aside className="sidebar">
                    <Link to="/auth/login">로그인</Link>
                    <Link to="/auth/signup">회원가입</Link>
                    <Link to="/auth/find-id">아이디 찾기</Link>
                    <span className="active">비밀번호 찾기</span>
                </aside>

                <section className="form-box">
                    <h2>비밀번호 찾기</h2>
                    <form onSubmit={handleResetPassword}>
                        <div className="input-group">
                            <label htmlFor="userId">아이디</label>
                            <input
                                type="text"
                                id="userId"
                                name="userId"
                                placeholder="아이디를 입력해주세요."
                                value={formData.userId}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="userEmail">이메일</label>
                            <div className="input-with-btn">
                                <input
                                    type="email"
                                    id="userEmail"
                                    name="userEmail"
                                    placeholder="example@email.com"
                                    value={formData.userEmail}
                                    onChange={handleChange}
                                />
                                <button type="button" onClick={sendAuthCode}>인증번호 전송</button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="emailCode">이메일 인증번호</label>
                            <div className="input-with-btn">
                                <input
                                    type="text"
                                    id="emailCode"
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value)}
                                />
                                <button type="button" onClick={handleVerifyAuthCode}>인증번호 확인</button>
                            </div>
                        </div>

                        {/* 새 비밀번호 */}
                        <div className="input-group">
                            <label htmlFor="userPassword">새 비밀번호</label>
                            <input
                                type="password"
                                id="userPassword"
                                name="userPassword"
                                value={formData.userPassword}
                                onChange={handleChange}
                                disabled={!emailVerified}
                            />
                        </div>

                        {/* 새 비밀번호 확인 */}
                        <div className="input-group">
                            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                disabled={!emailVerified}
                            />
                        </div>

                        <button type="submit" className="submit-btn">확인</button>
                    </form>
                </section>
            </main>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>비밀번호가 성공적으로 변경되었습니다.</p>
                        <button onClick={handleCloseModal}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FindPwdForm;