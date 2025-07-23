import React, { useState } from "react";
import axios from "axios";
import './FeedWriteForm.css'
import Header from "../common/Header";

const FeedWriteForm = ({ teamId, onSuccess }) => {
  const [formData, setFormData] = useState({
    feedTitle: "",
    feedContent: "",
    feedCategory: 0, // 기본은 cheer
    feedImage: null,
    userId: "testuser01", // 🔄 실제 로그인 연동 시 바꿔야 함
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      data.append("teamId", teamId);
      data.append("userId", formData.userId);
      data.append("feedTitle", formData.feedTitle);
      data.append("feedContent", formData.feedContent);
      data.append("feedCategory", formData.feedCategory);
      if (formData.feedImage) {
        data.append("feedImage", formData.feedImage);
      }

      await axios.post("http://localhost:18090/api/feed/write", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("등록 완료!");
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
