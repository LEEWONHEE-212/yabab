import React from "react";
import './GameCard.css'

const GameCard = ({game}) => {
    return(
        <div className="game-card">
            <div className="stadium">{game.stadiumAlias} | {game.startTime}</div>
            <div className="match">
                <img
                    src={`/Emblem/${game.homeTeamName}Emblem.jpg`}
                    alt={`${game.homeTeamName} 로고`}
                    className="team-logo"
                />
                <span>VS</span>
                <img
                    src={`/Emblem/${game.awayTeamName}Emblem.jpg`}
                    alt={`${game.awayTeamName} 로고`}
                    className="team-logo"
                />
            </div>

            <div className="team-names">
                <span>[H]{game.homeTeamName}</span> vs <span>{game.awayTeamName}[A]</span>
            </div>
        </div>
    );
};

export default GameCard;