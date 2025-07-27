import React from "react";
import "./CommentCard.css";

const CommentCard = ({ comment, user, onLike }) => {
    const handleLikeClick = () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        onLike(comment.commentId);
    };

    return (
        <div className="comment-card-container">
            <div className="comment-header">
                <strong className="comment-nickname">{comment.userNickname}</strong>
                <span className="comment-time">{comment.createdDate?.substring(0, 16).replace("T", " ")}</span>
            </div>

            <div className="comment-content">{comment.commentContent}</div>

            <div className="comment-actions">
                <button
                    className={`comment-like-btn ${comment.commentLiked ? "liked" : ""}`}
                    onClick={handleLikeClick}
                >
                    👍 ({comment.commentLikes || 0})
                </button>
                <button className="comment-report-btn">📢 신고</button>
            </div>
        </div>
    );
};

export default CommentCard;