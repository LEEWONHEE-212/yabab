import React, { useContext, useState } from "react";
import FeedTable from "./FeedTable";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../common/Header";
import "./FeedBoardSection.css"
import { UserContext } from "../../context/UserContext";
import { teamList } from "../../api/teamList";
import Top5Section from "./Top5Section";
import Footer from "../common/Footer";

const FeedBoardSection = () => {
    const [forceReload, setForceReload] = useState(false)
    const { teamId } = useParams();
    const [sortOption, setSortOption] = useState("latest"); // latest or likes
    const [category, setCategory] = useState(0);             // 0: cheer, 1: food

    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const handleWriteClick = () => {
        navigate(`/feed/${teamId}/write`);
    };

    const team = teamList.find(t => t.teamId === parseInt(teamId));
    const teamName = team ? team.name : "알 수 없음";

    return (
        <div>
            <Header />

            <Top5Section teamId={parseInt(teamId)} forceReload={forceReload} setForceReload={setForceReload}/>

            <section className="team-board-section">
                <h2>📣 {teamName} 피드</h2>

                <div className="feed-sort-tabs">
                    <button className={sortOption === "latest" ? "active" : ""} onClick={() => setSortOption("latest")}>최신순</button>
                    <button className={sortOption === "likes" ? "active" : ""} onClick={() => setSortOption("likes")}>추천순</button>
                    <button className={category === 0 ? "active" : ""} onClick={() => setCategory(0)}>응원글</button>
                    <button className={category === 1 ? "active" : ""} onClick={() => setCategory(1)}>먹거리</button>
                </div>

                <FeedTable teamId={parseInt(teamId, 10)} sortOption={sortOption} category={category} setForceReload={setForceReload} />

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
