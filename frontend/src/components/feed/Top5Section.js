import React from "react";
import Top5FeedList from "./Top5FeedList";
// import Top5FoodList from "./Top5FoodList";
// import Top5RestaurantList from "./Top5RestaurantList";

import "./Top5Section.css";

const Top5Section = ({ teamId, forceReload }) => {
  return (
    <div className="top5-section-wrapper">
      <div className="top5-card-area">
        <Top5FeedList teamId={teamId} category={0} forceReload={forceReload} />
        <Top5FeedList teamId={teamId} category={1} forceReload={forceReload}/> {/* 먹거리 */}
        {/* <Top5RestaurantList teamId={teamId} /> */}
      </div>
    </div>
  );
};

export default Top5Section;
