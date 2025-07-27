import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../context/UserContext";//  로그인 사용자 정보 가져오기
import "./FeedDetailForm.css";
import Header from "../common/Header";
import CommentCard from "./CommentCard";

const FeedDetailForm = () => {
    const { feedId, teamId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);   //  로그인한 사용자 정보

    const [feed, setFeed] = useState(null); //  게시글 정보
    const [liked, setLiked] = useState(false);  //  현재 사용자가 이 게시글에 추천했는지 여부
    const [comments, setComments] = useState([]);   //  댓글 목록
    const [newComment, setNewComment] = useState("");   //  댓글 작성(추가)

    const [prevFeed, setPrevFeed] = useState(null);
    const [nextFeed, setNextFeed] = useState(null);

    useEffect(() => {
        const fetchFeed = async() => {
            try {
                const response = await axios.get(
                    `http://localhost:18090/feed/detail/${feedId}`,
                    { params: { userId: user?.userId || null } }
                );
                if(response.data.success) {
                    setFeed(response.data.feed);
                    setLiked(response.data.liked || false);
                    setComments(response.data.comments);

                    console.log("현재 게시글 정보(feed):", response.data.feed);
                }
            } catch (error) {
                console.error("게시글 불러오기 실패", error);
            }
        };
        fetchFeed();
    }, [feedId]);

    const handleLike = async() => {
        if(!user) return alert("로그인이 필요합니다.");

        try {
            const response = await axios.post(
                `http://localhost:18090/feed/like/${feedId}`,
                { userId: user.userId}
            );

            if(response.data.success) {
                setLiked(response.data.liked);
                setFeed((prev) => ({
                    ...prev,
                    feedLikes: prev.feedLikes + (response.data.liked ? 1 : -1),
                }));
            }
        } catch (error) {
            console.error("추천 처리 실패", error);
        }
    };

    const handleCommentSubmit = async () => {
        if(!user || newComment.trim() === "") return;
        const response = await axios.post(
            'http://localhost:18090/feed/comment',
            {
                feedId: feed.feedId,
                userId: user.userId,
                commentContent: newComment
            }
        );

        if(response.data.success) {
            setNewComment("");
            const updated = await axios.get(
                `http://localhost:18090/feed/detail/${feedId}`,
                { params: {userId: user.userId} }
            );
            setComments(updated.data.comments);
        }
    };

    const handleCommentLike = async(commentId) => {
        if(!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:18090/feed/comment/like/${commentId}`,
                { userId: user.userId }
            );

            if(response.data.success) {
                setComments(prev =>
                    prev.map(c => {
                        if (c.commentId === commentId) {
                            const newLiked = !c.commentLiked;
                            const newLikes = newLiked ? c.commentLikes + 1 : c.commentLikes - 1;
                            return {
                                ...c,
                                commentLiked: newLiked,
                                commentLikes: newLikes,
                            };
                        }
                        return c;
                    })
                );
            }
        } catch (error) {
            console.error("댓글 추천 처리 실패", error);
        }
    }

    if(!feed) return <div>로딩 중...</div>;

    return (
        <div>
            <Header />
            <div className="post-detail-wrapper">
                <div className="post-title">{feed.feedTitle}</div>
                <div className="post-meta">
                    작성자: <strong>{feed.userNickname}</strong> | 작성일: {feed.createdDate?.substring(0, 10)} | 조회수: {feed.feedViews} | 추천수: {feed.feedLikes} | 댓글: {feed.feedCommentCount}
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
                    <button 
                        className={`like-button ${liked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        👍 추천
                    </button>
                    <button>📢 신고</button>
                </div>

                {/* <div className="post-ad-area">
                    <img src="#" alt="광고1" />
                    <img src="#" alt="광고2" />
                </div> */}

                <div className="post-nav-buttons">
                    <button className="post-nav-btn" onClick={() => navigate(-1)}>목록으로</button>
                </div>

                <div className="comment-box">
                    <h3>댓글 쓰기</h3>
                    <div className="comment-form-container">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={
                                    user
                                        ? "댓글을 입력하세요"
                                        : "댓글을 작성하려면 로그인 해주세요."
                                }
                                disabled={!user}
                                className="comment-textarea"
                            />
                            <button 
                                onClick={handleCommentSubmit}
                                className="comment-submit-btn"
                                disabled={!user || newComment.trim() === ""}
                            >
                                등록
                            </button>
                        </div>
                    <ul className="comment-list">
                        {comments.map((c) => (
                            <li key={c.commentId}>
                            <CommentCard
                                comment={c}
                                user={user}
                                onLike={handleCommentLike}
                            />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FeedDetailForm;