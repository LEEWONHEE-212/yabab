import React, { useContext, useState } from "react";
import FeedTable from "./FeedTable";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import "./FeedBoardSection.css"
import { UserContext } from "../../context/UserContext";

const FeedBoardSection = () => {
    const [sortOption, setSortOption] = useState("latest"); // latest or likes
    const [category, setCategory] = useState(0);             // 0: cheer, 1: food
    const [teamId] = useState(1);                            // 예시: 한화 TEAM_ID = 1

    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const handleWriteClick = () => {
        navigate(`/feed/${teamId}/write`);
    };



    return (
        <div>
            <Header />
            <section className="team-board-section">
                <h2>📣 한화 이글스 피드</h2>

                <div className="feed-sort-tabs">
                    <button className={sortOption === "latest" ? "active" : ""} onClick={() => setSortOption("latest")}>최신순</button>
                    <button className={sortOption === "likes" ? "active" : ""} onClick={() => setSortOption("likes")}>추천순</button>
                    <button className={category === 0 ? "active" : ""} onClick={() => setCategory(0)}>응원글</button>
                    <button className={category === 1 ? "active" : ""} onClick={() => setCategory(1)}>먹거리</button>
                </div>

                <FeedTable teamId={teamId} sortOption={sortOption} category={category} />

                {/* 로그인한 사용자만 글쓰기 버튼 노출 */}
                {user && (
                    <div className="feed-write-btn">
                        <button onClick={handleWriteClick}>✍️ 글쓰기</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default FeedBoardSection;
