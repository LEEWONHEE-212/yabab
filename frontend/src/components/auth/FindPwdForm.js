import React, { useState } from "react";
import axios from "axios";
import './FindPwdForm.css';
import Header from "../common/Header";

const FindPwdForm = () => {
    const[formData, setFormDate] = useState({
        userId:'',
        userEmail:'',
        emailCode:'',
        userPassword:'',
    });

    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailVerified, setEmailverified] = useState(false);

    const handleChange = (e) => {
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
                    authCode: formData.emailCode,
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

        if(formData.newPassword !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:18090/auth/find-password',
                {
                    userId: formData.userId,
                    userEmail: formData.userEmail,

                }
            )
        }
    }

    //  비밀번호 확인 input의 값이 바뀔 때 호출
    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };
}