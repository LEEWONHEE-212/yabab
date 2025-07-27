import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Top5FeedList.css";
import { Link } from "react-router-dom";

const Top5FeedList = ({ teamId, category }) => {
  const [topPosts, setTopPosts] = useState([]);

  //  카테고리별 제목 설정
  const title = category === 0 ? "🔥 추천 많은 응원글 Top 5" : "🔥 추천 많은 먹거리글 Top 5"
  useEffect(() => {
    const fetchTop5 = async () => {
      try {
        const response = await axios.get(
          `http://localhost:18090/feed/${teamId}/top5?category=${category}`
        );
        if (response.data.success) {
          setTopPosts(response.data.feedList); // API 응답 키 이름에 맞게 수정
        }
      } catch (error) {
        console.error("Top 5 피드 가져오기 실패", error);
      }
    };

    fetchTop5();
  }, [teamId, category]);

  return (
    <div className="top5-feed-box">
      <h3>{title}</h3>
      <ul>
        {topPosts.length === 0 ? (
          <li>게시글이 없습니다.</li>
        ) : (
          topPosts.map((post, index) => (
            <li key={post.feedId}>
              <span className="rank">{index + 1}.</span>
              <span className="title"><Link to={`/feed/${teamId}/view/${post.feedId}`}>{post.feedTitle}</Link></span>
              <span className="likes">👍 {post.feedLikes}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Top5FeedList;