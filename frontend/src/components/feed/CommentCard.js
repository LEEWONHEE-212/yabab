import React, { useState, useEffect } from "react";
import "./CommentCard.css";

const CommentCard = ({ comment, user, onLike, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);      //  수정 모드 여부
    const [editedContent, setEditedContent] = useState(comment.commentContent); //  수정 내용

    useEffect(() => {
        setEditedContent(comment.commentContent);
    }, [comment.commentContent]);
    
    const handleLikeClick = () => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }
        onLike(comment.commentId);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        if(editedContent.trim() === "") {
            alert("댓글 내용을 입력해주세요.");
            return;
        }

        onEdit(comment.commentId, editedContent);   //  부모 컴포넌트에서 처리
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setEditedContent(comment.commentContent);
        setIsEditing(false);
    };

    const handleDeleteClick = () => {
        if(window.confirm("댓글을 삭제하시겠습니까?")) {
            onDelete(comment.commentId);    //  부모 컴포넌트에서 처리
        }
    };

    return (
        <div className="comment-card-container">
            <div className="comment-header">
                <strong className="comment-nickname">{comment.userNickname}</strong>
                <span className="comment-time">{comment.createdDate?.substring(0, 16).replace("T", " ")}</span>
            </div>

            {/*수정 모드일 때 textarea, 아닐 때 그냥 내용 */}
            {isEditing ? (
                <textarea
                    className="comment-edit-textarea"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                />
            ) : (
                <div className="comment-content">{comment.commentContent}</div>
            )}

            <div className="comment-actions">
                <button
                    className={`comment-like-btn ${comment.commentLiked ? "liked" : ""}`}
                    onClick={handleLikeClick}
                >
                    👍 ({comment.commentLikes || 0})
                </button>

                {/* 본인 댓글일 경우에만 수정/삭제/저장/취소 버튼 표시 */}
                {user?.userId === comment.userId && (
                    <>
                        {isEditing ? (
                            <>
                                <button className="comment-save-btn" onClick={handleSaveClick}>💾 저장</button>
                                <button className="comment-cancel-btn" onClick={handleCancelClick}>❌ 취소</button>
                            </>
                        ) : (
                            <>
                                <button className="comment-edit-btn" onClick={handleEditClick}>수정</button>
                                <button className="comment-delete-btn" onClick={handleDeleteClick}>삭제</button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentCard;