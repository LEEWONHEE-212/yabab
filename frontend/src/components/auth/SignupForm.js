import React, {useState} from 'react';
import axios from 'axios';
import './SignupForm.css';

const SignupForm = () => {

    const [formData, setFormData] = useState({
        userId:'',
        userName:'',
        userNickname:'',
        userEmail:'',
        userPassword:'',
        userPhone:''
    });

    const handleChange = (e) => {
        const {name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault('');

        //  서버에 데이터를 전송하고 싶다
        try{
            //  서버에 전송할 데이터
            const submitData = {
                userId: formData.userId,
                userName: formData.userName,
                userNickname: formData.userNickname,
                userEmail: formData.userEmail,
                userPassword: formData.userPassword,
                userPhone: formData.userPhone
            }

            const response = await axios.post(
                'http://localhost:18090/yabab/addUser',
                submitData,
                {
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                }
            );

            if(response.data.success) {
                console.log("회원가입 성공");
            }
        } catch(error) {
            console.error("회원가입 에러", error);
        }
    };

    return();
};

export default SignupForm;