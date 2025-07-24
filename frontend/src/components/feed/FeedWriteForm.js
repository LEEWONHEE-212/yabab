import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import './FeedWriteForm.css'
import Header from "../common/Header";
import { UserContext } from "../../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

const FeedWriteForm = ({ onSuccess }) => {
  const { teamId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // 로그인 안 한 경우 접근 차단
  useEffect(() => {
    if (!user) {
      alert("로그인 후 글쓰기를 이용할 수 있습니다.");
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    feedTitle: "",
    feedContent: "",
    feedCategory: 0, // 기본은 cheer
    feedImage: null,
  });

  //  입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  //  이미지 선택 핸들러
  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      feedImage: e.target.files[0],
    }));
  };

  //  글 등록 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔥 전달된 teamId:", teamId, typeof teamId);

    if(!formData.feedTitle.trim() || !formData.feedContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const data = new FormData();
    data.append("teamId", parseInt(teamId));
    data.append("userId", user?.userId);
    data.append("feedTitle", formData.feedTitle);
    data.append("feedContent", formData.feedContent);
    data.append("feedCategory", formData.feedCategory);
    if (formData.feedImage) {
      data.append("feedImage", formData.feedImage);
    }
    try {
      const response = await axios.post(
        "http://localhost:18090/feed/write", data)
      if(response.data.success) {
        alert("글이 성공적으로 등록되었습니다.");
        if (onSuccess) onSuccess();
      } else {
        alert("등록 실패:" + response.data.message);
      } 
    } catch (error) {
      console.error("글 등록 중 오류:", error);
      alert("서버 오류로 인해 등록에 실패하였습니다.")
    }
  };

  return (
    <div>
      <Header />
      <form className="write-container" onSubmit={handleSubmit}>
        <h2>✍️ 글쓰기</h2>

        <div className="write-form-group">
          <label>제목</label>
          <input
            type="text"
            name="feedTitle"
            value={formData.feedTitle}
            onChange={handleChange}
            placeholder="제목을 입력해주세요"
            required
          />
        </div>

        <div className="write-form-group">
          <label>카테고리</label>
          <select
            name="feedCategory"
            value={formData.feedCategory}
            onChange={handleChange}
            required
          >
            <option value={0}>응원글</option>
            <option value={1}>먹거리</option>
          </select>
        </div>

        <div className="write-form-group">
          <label>내용</label>
          <textarea
            name="feedContent"
            value={formData.feedContent}
            onChange={handleChange}
            required
          />
        </div>

        <div className="write-form-group">
          <label>이미지 첨부</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleImageChange} 
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => window.history.back()}>
            취소
          </button>
          <button type="submit">등록</button>
        </div>
      </form>
    </div>
  );
};

export default FeedWriteForm;
