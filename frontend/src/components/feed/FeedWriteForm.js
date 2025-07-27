import React, { useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import './FeedWriteForm.css'
import Header from "../common/Header";
import { UserContext } from "../../context/UserContext";

const FeedWriteForm = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { user } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    feedTitle: "",
    feedContent: "",
    feedCategory: 0, // 기본은 cheer
    feedImage: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "feedCategory" ? parseInt(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      feedImage: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("teamId", parseInt(teamId));
      data.append("userId", user.userId);
      data.append("feedTitle", formData.feedTitle);
      data.append("feedContent", formData.feedContent);
      data.append("feedCategory", formData.feedCategory);
      if (formData.feedImage) {
        data.append("feedImage", formData.feedImage);
        data.append("feedImageName", formData.feedImage.name);
      }

      await axios.post("http://localhost:18090/feed/write", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("등록 완료!");
      navigate(`/feed/${teamId}/list`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("등록 실패:", err);
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
          <input type="file" onChange={handleFileChange} />
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
