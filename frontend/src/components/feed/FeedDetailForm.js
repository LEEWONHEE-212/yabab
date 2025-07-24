import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./FeedDetailForm.css";

const FeedDetailForm = () => {
    const { feedId } = useParams();
    const [feed, setFeed] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeed = async() => {
            try {
                const response = await axios.get(`http://localhost:18090/feed/detail/${feedId}`);
                if(response.data.success) {
                    setFeed(response.data.feed);
                }
            } catch (error) {
                console.error("게시글 불러오기 실패", error);
            }
        };
        fetchFeed();
    }, [feedId]);

    if(!feed) return <div>로딩 중...</div>;

    return (
        <div className="post-detail-wrapper">
            <div className="post-title">{feed.feedTitle}</div>
            <div className="post-meta">
                작성자: <strong>{feed.userId}</strong> | 작성일: {feed.createdDate?.substring(0, 10)} | 조회수: {feed.feedViews} | 추천수: {feed.feedLikes} | 댓글: {feed.feedCommentCount}
            </div>

            <div className="post-body">
                {feed.feedContent}
                {feed.feedImagePath && (
                    <img 
                        src={`http://localhost:18090${feed.feedImagePath}`}
                        alt="게시글 이미지" 
                        className="post-image" />
                )}
            </div>

            <div className="post-util-bar">
                <button>👍 추천</button>
                <button>📢 신고</button>
            </div>

            <div className="post-ad-area">
                <img src="#" alt="광고1" />
                <img src="#" alt="광고2" />
            </div>

            <div className="post-nav-buttons">
                <button>이전</button>
                <button onClick={() => navigate(-1)}>목록으로</button>
                <button>다음</button>
            </div>

            <div className="post-comments">
                <div className="comment-login-required">
                    댓글을 작성하려면 <a href="/auth/login">로그인</a> 해주세요.
                </div>
            </div>
        </div>
    );
};

export default FeedDetailForm;