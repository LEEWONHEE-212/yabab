// 📁 src/pages/TeamMainPage.jsx
import React from "react";
import { teamList } from "../../api/teamList";
import TeamCard from "./TeamCard";
import "./FeedMain.css";
import Header from "../common/Header";
import Footer from "../common/Footer";

const FeedMain = () => {
  const topTeams = teamList.slice(0, 5);
  const bottomTeams = teamList.slice(5);

  return (
    <div>
      <Header />
      <div className="team-main-container">
        <h2>응원할 팀을 선택해주세요</h2>

        <div className="team-grid-row">
          {topTeams.map((team) => (
            <TeamCard key={team.teamId} team={team} />
          ))}
        </div>

        <div className="team-grid-row">
          {bottomTeams.map((team) => (
            <TeamCard key={team.teamId} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedMain;
