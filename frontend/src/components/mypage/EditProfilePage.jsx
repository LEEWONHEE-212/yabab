// src/pages/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfilePage.css'; // EditProfilePage 전용 CSS 또는 모듈 CSS

function EditProfilePage() {
    const navigate = useNavigate();
    // 실제로는 API에서 사용자 정보를 불러와 초기값으로 설정합니다.
    const [formData, setFormData] = useState({
        nickname: '',
        name: '',
        team: '',
        profileImage: '' // 현재 이미지 URL 또는 파일 객체
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 실제 API 호출로 현재 사용자 정보를 가져오는 시뮬레이션
        const fetchUserData = async () => {
            try {
                setLoading(true);
                // 더미 데이터 (실제로는 fetch('/api/user/profile'))
                const response = {
                    nickname: '사용자닉네임',
                    name: '성 이 름',
                    team: 'NC다이노스',
                    profileImage: 'https://via.placeholder.com/100'
                };
                setFormData(response);
            } catch (err) {
                setError('사용자 정보를 불러오는데 실패했습니다.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'profileImage' && files && files[0]) {
            // 파일 입력 처리 (여기서는 단순히 파일 객체를 저장)
            // 실제로는 파일을 서버에 업로드하고 URL을 받아와야 합니다.
            setFormData(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) })); // 미리보기용 URL
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // 실제 API 호출 (예: fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(formData) }))
            console.log('수정된 정보:', formData);
            // API 호출 성공 시
            alert('정보가 성공적으로 수정되었습니다!');
            navigate('/mypage'); // 마이페이지로 돌아가기
        } catch (err) {
            setError('정보 수정에 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/mypage'); // 마이페이지로 돌아가기
    };

    if (loading) {
        return <div className="loading">사용자 정보 로딩 중...</div>;
    }
    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="edit-profile-container">
            <h1>내 정보 수정</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="profileImage">프로필 이미지</label>
                    <div className="profile-image-preview">
                        {formData.profileImage ? <img src={formData.profileImage} alt="프로필 미리보기" /> : <div className="placeholder-image">이미지 없음</div>}
                        <input
                            type="file"
                            id="profileImage"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="nickname">닉네임</label>
                    <input
                        type="text"
                        id="nickname"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="name">성명</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="team">응원하는 팀</label>
                    <input
                        type="text"
                        id="team"
                        name="team"
                        value={formData.team}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? '저장 중...' : '저장'}
                    </button>
                    <button type="button" onClick={handleCancel} disabled={loading}>
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProfilePage;