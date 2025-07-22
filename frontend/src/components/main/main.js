import React from "react";
import './Main.css';
import Header from "../common/Header";
import GameScheduleSection from "./GameScheduleSection";

const Main = () => {
    return (
        <div>
            <Header />
            {/* 광고 배너 */}
            <div className="banner">
                <a href="https://example.com" target="_blank" rel="noreferrer">
                    <img src="./human.jpg" alt="광고 배너" />
                </a>
            </div>

            <GameScheduleSection />
            
            {/*야구팀 목록 섹션*/}
            <section className="team-section">
                <h2>야구팀</h2>
                <div className="team-grid">
                    {[
                        { name: '한화', emblem: '한화Emblem.jpg' },
                        { name: 'LG', emblem: 'LGEmblem.jpg' },
                        { name: '롯데', emblem: '롯데Emblem.jpg' },
                        { name: 'KIA', emblem: 'KIAEmblem.jpg' },
                        { name: 'SSG', emblem: 'SSGEmblem.jpg' },
                        { name: 'KT', emblem: 'KTEmblem.jpg' },
                        { name: '삼성', emblem: '삼성Emblem.jpg' },
                        { name: 'NC', emblem: 'NCEmblem.jpg' },
                        { name: '두산', emblem: '두산Emblem.jpg' },
                        { name: '키움', emblem: '키움Emblem.jpg' }
                    ].map((team, index) => (
                        <div className="team-card" key={index}>
                            <img src={`./Emblem/${team.emblem}`} alt={`${team.name} 팀 로고`} />
                            <h3>{team.name}</h3>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Main;