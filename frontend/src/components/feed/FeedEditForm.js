import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import Header from "../common/Header";
import "./FeedEditForm.css"; // 필요시 CSS 분리

const FeedEditForm = () => {
    const { feedId } = useParams();
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [teamId, setTeamId] = useState(null); // 수정 후 돌아갈 목록용

    useEffect(() => {
        // 기존 게시글 정보 불러오기
        const fetchFeed = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:18090/feed/detail/${feedId}`, 
                    { params: { userId: user?.userId || null }}
                );

                if (response.data.success) {
                    const feed = response.data.feed;
                    setTitle(feed.feedTitle);
                    setContent(feed.feedContent);
                    setTeamId(feed.teamId);
                }
            } catch (err) {
                console.error("게시글 불러오기 실패", err);
            }
        };
        fetchFeed();
    }, [feedId]);

    const handleUpdate = async () => {
        if (title.trim() === "" || content.trim() === "") {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("feedId", feedId);
        formData.append("feedTitle", title);
        formData.append("feedContent", content);
        formData.append("userId", user.userId);
        if (imageFile) formData.append("imageFile", imageFile);

        try {
            const response = await axios.put(
                "http://localhost:18090/feed/update", 
                formData, 
                { headers: {"Content-Type": "multipart/form-data"} }
            );

            if (response.data.success) {
                alert("수정 완료!");
                navigate(`/feed/${teamId}/view/${feedId}`);
            } else {
                alert("수정 실패");
            }
        } catch (error) {
            console.error("게시글 수정 실패", error);
            alert("서버 오류로 수정 실패");
        }
    };

    return (
        <div>
            <Header />
            <div className="feed-edit-container">
                <h2>게시글 수정</h2>
                <input
                    type="text"
                    className="feed-edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                />
                
                <textarea
                    className="feed-edit-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                />
                
                <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />

                <div className="feed-edit-buttons">
                    <button className="edit-cancel-btn" onClick={() => window.history.back()}>취소</button>
                    <button className="edit-complete-btn" onClick={handleUpdate}>수정 완료</button>
                </div>
            </div>
        </div>
    );
};

export default FeedEditForm;
