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
    const [imageFile, setImageFile] = useState(null); // 새로 선택된 파일
    const [currentImagePath, setCurrentImagePath] = useState(""); // ⭐ 기존 이미지 경로 상태 추가 ⭐
    const [currentImageName, setCurrentImageName] = useState(""); // ⭐ 기존 이미지 파일명 상태 추가 ⭐
    const [isImageRemoved, setIsImageRemoved] = useState(false); // ⭐ 이미지 삭제 여부 상태 추가 ⭐

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
                    // ⭐ 기존 이미지 정보 상태에 저장 ⭐
                    setCurrentImagePath(feed.feedImagePath || "");
                    setCurrentImageName(feed.feedImageName || "");
                } else {
                    alert(response.data.message || "게시글 정보를 불러오는데 실패했습니다.");
                    navigate(-1); // 이전 페이지로 돌아가기
                }
            } catch (err) {
                console.error("게시글 불러오기 실패", err);
                alert("게시글 정보를 불러오는 중 오류가 발생했습니다.");
                navigate(-1); // 이전 페이지로 돌아가기
            }
        };
        fetchFeed();
    }, [feedId, user, navigate]); // 의존성 배열에 user와 navigate 추가

    // 이미지 파일 선택 핸들러
    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
        setIsImageRemoved(false); // 새 이미지 선택 시 삭제 상태 초기화
    };

    // 이미지 삭제 버튼 핸들러
    const handleRemoveImage = () => {
        setImageFile(null); // 새로 선택된 파일 초기화
        setCurrentImagePath(""); // 기존 이미지 경로 초기화 (화면에서 제거)
        setCurrentImageName(""); // 기존 이미지 파일명 초기화
        setIsImageRemoved(true); // 이미지 삭제 상태 true로 설정
    };


    const handleUpdate = async () => {
        if (title.trim() === "" || content.trim() === "") {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("feedId", feedId);
        formData.append("feedTitle", title);
        formData.append("feedContent", content);
        formData.append("userId", user.userId); // 현재 로그인한 사용자 ID

        // ⭐ 이미지 처리 로직 개선 ⭐
        if (imageFile) { // 1. 새로운 이미지가 선택된 경우
            formData.append("imageFile", imageFile);
            // 이 경우 feedImagePath와 feedImageName은 백엔드에서 새로 생성되므로 여기서는 보내지 않음
        } else if (isImageRemoved) { // 2. 이미지 삭제 버튼을 누른 경우
            // 백엔드에서 NULL로 인식하도록 명시적으로 빈 문자열을 보냄
            formData.append("feedImagePath", "");
            formData.append("feedImageName", "");
        } else { // 3. 이미지가 변경되지 않은 경우 (기존 이미지 유지)
            // 기존 이미지 경로와 이름을 그대로 백엔드로 다시 보냅니다.
            formData.append("feedImagePath", currentImagePath || "");
            formData.append("feedImageName", currentImageName || "");
        }

        try {
            const response = await axios.put(
                "http://localhost:18090/feed/update",
                formData,
                { headers: {"Content-Type": "multipart/form-data"} }
            );

            if (response.data.success) {
                alert("수정 완료!");
                navigate(`/feed/${teamId}/view/${feedId}`); // 수정된 게시글 상세 페이지로 이동
            } else {
                alert(response.data.message || "수정 실패");
            }
        } catch (error) {
            console.error("게시글 수정 실패", error.response ? error.response.data : error.message);
            alert(error.response?.data?.message || "서버 오류로 수정 실패");
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

                {/* ⭐ 기존 이미지 미리보기 및 삭제 버튼 ⭐ */}
                {currentImagePath && !imageFile && (
                    <div className="current-image-preview">
                        <img src={`http://localhost:18090${currentImagePath}`} alt="현재 이미지" />
                        <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                            삭제
                        </button>
                    </div>
                )}

                {/* ⭐ 새로운 이미지 선택 input ⭐ */}
                <input type="file" onChange={handleImageChange} />

                <div className="feed-edit-buttons">
                    <button className="edit-cancel-btn" onClick={() => navigate(-1)}>취소</button> {/* history.back 대신 navigate(-1) 사용 */}
                    <button className="edit-complete-btn" onClick={handleUpdate}>수정 완료</button>
                </div>
            </div>
        </div>
    );
};

export default FeedEditForm;
