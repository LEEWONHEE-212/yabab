import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import FindIdForm from "../components/auth/FindIdForm";
import FindPwdForm from "../components/auth/FindPwdForm";

const AuthPage = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/find-id" element={<FindIdForm />} />
            <Route path="/find-pwd" element={<FindPwdForm />} />
        </Routes>
    );
};

export default AuthPage;