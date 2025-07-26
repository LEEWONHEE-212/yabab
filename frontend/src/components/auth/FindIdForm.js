import React, { useState } from "react";
import axios from "axios";
import './FindIdForm.css';
import Header from "../common/Header";
import { Link } from "react-router-dom";

const FindIdForm = () => {
    const [formData, setFormData] = useState({
        userName:'',
        userEmail:'',
    });

    const [emailCode, setEmailCode] = useState('');
    const [emailVerifed, setEmailverified] = useState(false);
    const [foundId, setFoundId] = useState('');

    const handleChange = (e) => {
        const { name, value} = e.target;
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
                'http://192.168.0.47:18090/auth/sendAuthCode',
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
                'http://192.168.0.47:18090/auth/verifyAuthCode',
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

    //  아이디 찾기 요청
    const handleFindId = async(e) => {
        e.preventDefault();

        if(!emailVerifed) {
            alert("이메일 인증을 먼저 완료해주세요.");
            return;
        }

        try{
            const response = await axios.post(
                'http://192.168.0.47:18090/auth/findId',
                {
                    userName: formData.userName,
                    userEmail: formData.userEmail
                }
            );

            if(response.data.success) {
                setFoundId(response.data.userId);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("아이디 찾기 실패", error);
            alert("서버와 통신 오류로 인해 실패하였습니다.")
        }
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
                                />
                                <button type="button" onClick={handleVerifyAuthCode}>인증번호 확인</button>
                            </div>
                        </div>

                        <button type="submit" className="submit-btn">확인</button>
                    </form>

                    {/* 결과창 */}
                    {foundId && (
                        <div className="result-popup">
                            <p>회원님의 아이디는 <br /><strong>{foundId}</strong> 입니다.</p>
                            <button onClick={() => setFoundId('')}>닫기</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};
export default FindIdForm;