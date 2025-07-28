import React, {useState} from 'react';
import axios from 'axios';
import './SignupForm.css';
import Header from '../common/Header';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate import 추가

const SignupForm = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용

    // 입력된 사용자 정보를 상태로 관리
    const [formData, setFormData] = useState({
        userId:'',
        userName:'',
        userNickname:'',
        userPassword:'',
        userPhone:'',
        userEmail:'',
        userRole: 1
    });

    const [emailCode, setEmailCode] = useState('');
    // 비밀번호 확인 입력값은 별도로 상태 관리
    const [confirmPassword, setConfirmPassword] = useState('');

    // 각 input 요소의 값이 변경될 때 호출되는 함수
    const handleChange = (e) => {
        const {name, value} = e.target;

        // 입력값을 상태에 반영함 (userRole은 숫자로 변환)
        setFormData((prev) => ({
            ...prev,
            [name]: name === "userRole" ? Number(value) : value
        }));
    };

    // 비밀번호 확인 input의 값이 바뀔 때 호출
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    // 폼 제출 시 실행되는 함수(회원가입 시도)
    const handleSubmit = async(e) => {
        // 페이지 새로고침 방지
        e.preventDefault();

        // 비밀번호와 비밀번호 확인이 일치하는지 검사
        if (formData.userPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!formData.userPassword || formData.userPassword.length < 6) {
            alert("비밀번호는 6자리 이상이어야 합니다.");
            return;
        }

        // 서버에 데이터를 전송하고 싶다
        try{
            // 서버에 전송할 데이터
            const submitData = {
                userId: formData.userId,
                userName: formData.userName,
                userNickname: formData.userNickname,
                userEmail: formData.userEmail,
                userPassword: formData.userPassword,
                userPhone: formData.userPhone,
                userRole: Number(formData.userRole),
                confirmPassword: confirmPassword
            }

            // 서버에 POST 요청을 보내 회원가입 시도
            const response = await axios.post(
                'http://localhost:18090/auth/addUser', // 백엔드 주소
                submitData, // 전송 데이터
                {
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                }
            );

            // 서버 응답 처리: 회원가입 성공 시
            if(response.data.success) {
                console.log("회원가입 성공");
                alert("회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다."); // 성공 알림
                navigate('/auth/login'); // 로그인 페이지로 리디렉션
            } else {
                // 백엔드에서 success: false와 함께 메시지를 보낼 경우
                alert(response.data.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } catch(error) {
            // 에러 처리: 네트워크 오류, 서버 오류 등
            console.error("회원가입 에러", error);
            // 서버에서 보낸 에러 메시지가 있다면 사용, 없으면 일반 메시지
            alert(error.response?.data?.message || "회원가입 중 오류가 발생했습니다. 서버 로그를 확인해주세요.");
        }
    };

    // 아이디 중복 확인
    const checkUserId = async() => {
        if(!formData.userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }

        try{
            const response = await axios.get(
                'http://localhost:18090/auth/checkId',
                {params: {userId: formData.userId}},
                {headers: {"Content-type": "application/json"},}
            );

            const{available, message} = response.data;
            alert(message); // 백엔드에서 온 메시지를 그대로 띄움
        } catch (error) {
            console.error("아이디 확인 실패", error);
            alert("아이디 중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 닉네임 중복 확인
    const checkUserNickname = async () => {
        if (!formData.userNickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        try {
            const response = await axios.get(
                'http://localhost:18090/auth/checkNickname',
                {params: {userNickname: formData.userNickname}}
            );

            const{available, message} = response.data;
            alert(message);
        } catch (error) {
            console.error("닉네임 중복 확인 오류", error);
            alert("닉네임 중복 확인 중 오류가 발생했습니다.");
        }
    };

    // 이메일 인증번호 전송 요청
    const sendAuthCode = async() => {
        if(!formData.userEmail.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }

        try{
            const response = await axios.post(
                'http://localhost:18090/auth/sendAuthCode',
                null,   // 바디 없음
                {params: {email: formData.userEmail}}
            );

            const{result, message} = response.data;
            alert(message);
        } catch (error) {
            console.error("이메일 인증 요청 오류", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    // 인증번호 확인 요청
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
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("인증번호 확인 에러", error);
            alert ("인증번호 확인 중 오류가 발생했습니다.");
        }
    };

    return(
        <div>
            <Header />
            {/*본문*/}
            <main className='container'>
                <aside className='sidebar'>
                    <Link to="/auth/login">로그인</Link>
                    <span className='active'>회원가입</span>
                    <Link to="/auth/find-id">아이디 찾기</Link>
                    <Link to="/auth/find-pwd">비밀번호 찾기</Link>
                </aside>

                <section className='signup-form'>
                    <h2>회원가입</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='input-group'>
                            <label>아이디</label>
                            <div className='input-with-btn'>
                                <input
                                    type='text'
                                    name='userId'
                                    placeholder='아이디를 입력해주세요'
                                    value={formData.userId}
                                    onChange={handleChange}
                                />
                                <button type='button' onClick={checkUserId}>아이디 확인</button>
                            </div>
                        </div>

                        <div className='input-group'>
                            <label>닉네임</label>
                            <div className='input-with-btn'>
                                <input
                                    type='text'
                                    name='userNickname'
                                    placeholder='닉네임을 입력해주세요'
                                    value={formData.userNickname}
                                    onChange={handleChange}
                                />
                                <button type='button' onClick={checkUserNickname}>닉네임 확인</button>
                            </div>
                        </div>

                        <div className='input-group'>
                            <label>비밀번호</label>
                            <input
                                type='password'
                                name='userPassword'
                                value={formData.userPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='input-group'>
                            <label>비밀번호 확인</label>
                            <input
                                type='password'
                                name='confirmPassword'
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                        </div>

                        <div className='input-group'>
                            <label>이름</label>
                            <input
                                type='text'
                                name='userName'
                                placeholder='ex)홍길동'
                                value={formData.userName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='input-group'>
                            <label>전화번호</label>
                            <input
                                type='tel'
                                name='userPhone'
                                placeholder='ex)010-1234-5678'
                                value={formData.userPhone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='input-group'>
                            <label>이메일</label>
                            <div className='input-with-btn'>
                                <input
                                    type='email'
                                    name='userEmail'
                                    placeholder='example@email.com'
                                    value={formData.userEmail}
                                    onChange={handleChange}
                                />
                                <button type='button' onClick={sendAuthCode}>인증번호 전송</button>
                            </div>
                        </div>

                        <div className='input-group'>
                            <label>이메일 인증번호</label>
                            <div className='input-with-btn'>
                                <input
                                    type='text'
                                    name='emailCode'
                                    value={emailCode}
                                    onChange={(e) => setEmailCode(e.target.value)}
                                />
                                <button type='button' onClick={handleVerifyAuthCode}>인증번호 확인</button>
                            </div>
                        </div>

                        <div className='role-select'>
                            <label>
                                <input
                                    type='radio'
                                    name='userRole'
                                    value={1}   // 일반 사용자
                                    checked={formData.userRole === 1}
                                    onChange={handleChange}
                                /> 일반
                            </label>

                            <label>
                                <input
                                    type='radio'
                                    name='userRole'
                                    value={2}   // 사장님
                                    checked={formData.userRole === 2}
                                    onChange={handleChange}
                                />사장님
                            </label>
                        </div>

                        <button type='submit' className='submit-btn'>가입하기</button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default SignupForm;
