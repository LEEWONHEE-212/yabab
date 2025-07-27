import React from "react";
import { useNavigate } from "react-router-dom";
import "./TeamCard.css";

const TeamCard = ({ team }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/feed/${team.teamId}/list`);
  };

  return (
    <div className="team-card" onClick={handleClick}>
      <img
        src={`/emblem/${team.emblem}`} 
        alt={`${team.name} 엠블럼`}
        className="team-card-logo"
      />
      <div className="team-name">{team.name}</div>
    </div>
  );
};

export default TeamCard;
