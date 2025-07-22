import React from "react";
import GameCard from "./GameCard";
import './GameScheduleList.css';

const GameScheduleList = ({ games }) => {
    console.log("✅ [GameScheduleList] games:", games);
    return (
        <section className="schedule-section">
            <div className="schedule-grid">
                {games?.map((game, index) => (
                    <GameCard key={index} game={game} />
                ))}
            </div>
        </section>
    );
};

export default GameScheduleList;