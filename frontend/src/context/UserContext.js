import { createContext, useState } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        //  새로고침해도 유지되도록 세션 저장값 불러오기
        const storedUser = sessionStorage.getItem("user");
        if(!storedUser || storedUser === "undefined") {
            return null;
        }
        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("사용자 정보 파싱 실패:", error);
            return null;
        }
    });

    return (
        <UserContext.Provider value={{ user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};