import React, { useState } from "react";
import axios from "axios";
import './FindIdForm.css'; // 기존 FindIdForm 스타일
import Header from "../common/Header";
import { Link, useNavigate } from "react-router-dom"; // useNavigate를 import 합니다.

// FindIdResultModal 컴포넌트를 FindIdForm.jsx 파일 내부에 정의합니다.
const FindIdResultModal = ({ isOpen, onClose, foundId }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}>
                    &times; {/* 닫기 아이콘 (X) */}
                </button>
                <h2>아이디 찾기 결과</h2>
                <div className="modal-body">
                    {foundId ? (
                        <p>회원님의 아이디는 <br /><strong>{foundId}</strong> 입니다.</p>
                    ) : (
                        <p>일치하는 회원 정보가 없습니다.</p> // 아이디를 찾지 못한 경우의 메시지
                    )}
                </div>
                <div className="modal-footer">
                    <button className="modal-confirm-button" onClick={onClose}>확인</button>
                </div>
            </div>
        </div>
    );
};

const FindIdForm = () => {
    const navigate = useNavigate(); // useNavigate 훅을 사용합니다.

    const [formData, setFormData] = useState({
        userName: '',
        userEmail: '',
    });

    const [emailCode, setEmailCode] = useState('');
    const [emailVerifed, setEmailverified] = useState(false);
    const [foundId, setFoundId] = useState(''); // 찾은 아이디
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- 이메일 인증 관련 로직 ---
    const sendAuthCode = async () => {
        if (!formData.userEmail.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:18090/auth/sendAuthCode',
                null,
                { params: { email: formData.userEmail } }
            );
            const { result, message } = response.data;
            alert(message);
        } catch (error) {
            console.error("이메일 인증 요청 오류:", error.response ? error.response.data : error.message);
            alert(error.response?.data?.message || "서버와 통신 중 오류가 발생했습니다.");
        }
    };

    const handleVerifyAuthCode = async () => {
        if (!formData.userEmail.trim() || !emailCode.trim()) {
            alert("이메일과 인증번호를 모두 입력해주세요.");
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:18090/auth/verifyAuthCode',
                { email: formData.userEmail, authCode: emailCode },
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.data.verified) {
                alert(response.data.message);
                setEmailverified(true);
            } else {
                alert(response.data.message);
                setEmailverified(false);
            }
        } catch (error) {
            console.error("인증번호 확인 에러:", error.response ? error.response.data : error.message);
            alert(error.response?.data?.message || "인증번호 확인 중 오류가 발생했습니다.");
        }
    };

    // --- 아이디 찾기 로직 (모달 통합) ---
    const handleFindId = async (e) => {
        e.preventDefault();

        if (!emailVerifed) {
            alert("이메일 인증을 먼저 완료해주세요.");
            return;
        }

        if (!formData.userName.trim() || !formData.userEmail.trim()) {
            alert("이름과 이메일을 모두 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:18090/auth/findId',
                { userName: formData.userName, userEmail: formData.userEmail },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log("아이디 찾기 응답:", response.data);

            if (response.data.success) {
                if (response.data.userId) {
                    setFoundId(response.data.userId); // 찾은 아이디 저장
                } else {
                    setFoundId(''); // 아이디가 없으면 빈 값으로 설정
                    console.error("아이디는 찾았으나 userId 필드 누락:", response.data);
                }
            } else {
                setFoundId(''); // 실패 시 아이디 없음으로 설정
            }
            setIsModalOpen(true); // 성공/실패 여부와 관계없이 모달을 엽니다.
        } catch (error) {
            console.error("아이디 찾기 실패:", error.response ? error.response.data : error.message);
            setFoundId(''); // 오류 발생 시 아이디 없음으로 설정
            setIsModalOpen(true); // 오류 발생 시에도 모달을 엽니다.
        }
    };

    // 모달 닫기 함수: 로그인 페이지로 리다이렉트 추가
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFoundId(''); // 모달 닫을 때 찾은 아이디 초기화
        // 필요하다면 폼 데이터도 초기화
        // setFormData({ userName: '', userEmail: '' });
        // setEmailCode('');
        // setEmailverified(false);

        // 로그인 페이지로 이동
        navigate('/auth/login');
    };

    return (
        <div>
            <Header />
            <main className="container">
                <aside className="sidebar">
                    <Link to="/auth/login">로그인</Link>
                    <Link to="/auth/signup">회원가입</Link>
                    <span className="active">아이디 찾기</span>
                    <Link to="/auth/find-pwd">비밀번호 찾기</Link>
                </aside>

                <section className="form-box">
                    <h2>아이디 찾기</h2>
                    <form onSubmit={handleFindId}>
                        <div className="input-group">
                            <label htmlFor="userName">이름</label>
                            <input
                                type="text"
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="userEmail">이메일</label>
                            <div className="input-with-btn">
                                <input
                                    type="email"
                                    id="userEmail"
                                    name="userEmail"
                                    value={formData.userEmail}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    required
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
                                    name="emailCode"
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={handleVerifyAuthCode}>인증번호 확인</button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">확인</button>
                    </form>

                    <FindIdResultModal
                        isOpen={isModalOpen} // isModalOpen 상태에 따라 모달 표시
                        onClose={handleCloseModal} // 모달 닫기 함수 전달
                        foundId={foundId} // 찾은 아이디 정보 전달
                    />
                </section>
            </main>
        </div>
    );
};

export default FindIdForm;