import React from "react";
import './Main.css';
import Header from "../common/Header";
import GameScheduleSection from "./GameScheduleSection";
import { useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';

const Main = () => {
    const navigate = useNavigate();

    const baseballTeams = [
        { name: '한화', emblem: '한화Emblem.jpg', stadiumId: 1 },
        { name: 'LG', emblem: 'LGEmblem.jpg', stadiumId: 2 },
        { name: '롯데', emblem: '롯데Emblem.jpg', stadiumId: 3 },
        { name: 'KIA', emblem: 'KIAEmblem.jpg', stadiumId: 4 },
        { name: 'SSG', emblem: 'SSGEmblem.jpg', stadiumId: 5 },
        { name: 'KT', emblem: 'KTEmblem.jpg', stadiumId: 6 },
        { name: '삼성', emblem: '삼성Emblem.jpg', stadiumId: 7 },
        { name: 'NC', emblem: 'NCEmblem.jpg', stadiumId: 8 },
        { name: '두산', emblem: '두산Emblem.jpg', stadiumId: 2 },
        { name: '키움', emblem: '키움Emblem.jpg', stadiumId: 9 }
    ];

    const handleTeamClick = (stadiumId) => {
        // ⭐ 이 부분을 수정해야 합니다. 백틱(`)과 ${}를 사용하여 stadiumId를 URL에 포함시킵니다.
        navigate(`/stadium/${stadiumId}`);
    };

    return (
        <div>
            <Header />
            {/* 광고 배너 */}
            <div className="banner">
                <a href="https://myseatcheck.com/" target="_blank" rel="noreferrer">
                    <img src="./banner001.jpg" alt="광고 배너" />
                </a>
            </div>

            <GameScheduleSection />
            
            {/* 야구팀 목록 섹션 */}
            <section className="team-section">
                <h2>야구팀</h2>
                <div className="team-grid">
                    {baseballTeams.map((team, index) => (
                        <div
                            className="team-card"
                            key={index}
                            onClick={() => handleTeamClick(team.stadiumId)} // 이 부분은 이미 잘 되어 있습니다.
                            style={{ cursor: 'pointer' }}
                        >
                            <img src={`./Emblem/${team.emblem}`} alt={`${team.name} 팀 로고`} />
                            <h3>{team.name}</h3>
                        </div>
                    ))}
                </div>
            </section>
                <Footer/>
        </div>
    );
};

export default Main;