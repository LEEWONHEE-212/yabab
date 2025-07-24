import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './EditProfilePage.css';

function EditProfilePage({ isOpen, onClose }) {
    const { user, setUser } = useContext(UserContext);

    const [formData, setFormData] = useState({
        userNickname: '',
        userName: '',
        userFavoriteTeam: '',
        userEmail: '',
        userPhone: '',
        currentProfileImageUrl: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            const initialImageUrl =
                user.userImagePath && user.userImageName
                    ? `http://localhost:18090${user.userImagePath}${user.userImageName}`
                    : '';

            setFormData({
                userNickname: user.userNickname || '',
                userName: user.userName || '',
                userFavoriteTeam: user.userFavoriteTeam || '',
                userEmail: user.userEmail || '',
                userPhone: user.userPhone || '',
                currentProfileImageUrl: initialImageUrl,
            });
            setImageFile(null);
            setError(null);
            setLoading(false);
            fetchTeams();
        }
    }, [user, isOpen]);

    const fetchTeams = async () => {
        try {
            const response = await axios.get('http://localhost:18090/api/mypage/teams');
            setTeams(response.data);
        } catch (err) {
            console.error('팀 목록 로드 실패:', err);
            setError('팀 목록을 불러오는데 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setFormData(prev => ({ ...prev, currentProfileImageUrl: URL.createObjectURL(file) }));
        }
    };

    const handleDeleteImage = async () => {
        if (!user || !user.userId) {
            setError("사용자 ID를 찾을 수 없습니다.");
            return;
        }

        if (!window.confirm('정말로 프로필 이미지를 삭제하시겠습니까?')) return;

        setLoading(true);
        setError(null);

        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://localhost:18090/api/mypage/${user.userId}/profile/image`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` })
                }
            });

            const newUserContext = {
                ...user,
                userImagePath: null,
                userImageName: null,
            };
            setUser(newUserContext);
            sessionStorage.setItem("user", JSON.stringify(newUserContext));

            setFormData(prev => ({ ...prev, currentProfileImageUrl: '' }));
            setImageFile(null);

            alert('프로필 이미지가 성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('프로필 이미지 삭제 실패:', err);
            const errorMessage = err.response?.data?.message || '이미지 삭제에 실패했습니다. 다시 시도해주세요.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userId = user.userId;
            if (!userId) throw new Error("사용자 ID를 찾을 수 없습니다.");

            const formDataToSend = new FormData();

            const userData = {
                userId: userId, // 반드시 포함!
                userNickname: formData.userNickname,
                userName: formData.userName,
                userEmail: formData.userEmail,
                userPhone: formData.userPhone,
                userFavoriteTeam: formData.userFavoriteTeam,
            };

            // ✅ 수정된 부분: Blob으로 JSON 전송
            formDataToSend.append(
                'data',
                new Blob([JSON.stringify(userData)], { type: 'application/json' })
            );

            if (imageFile) {
                formDataToSend.append('profileImage', imageFile);
            }

            const token = sessionStorage.getItem('token');

            const response = await axios.put(
                `http://localhost:18090/api/mypage/${userId}/profile`,
                formDataToSend,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        // ❌ Content-Type 지정하지 마세요. Axios가 자동 설정
                    },
                }
            );

            const updatedUser = response.data;
            const newUserContext = {
                ...user,
                userNickname: updatedUser.userNickname,
                userName: updatedUser.userName,
                userFavoriteTeam: updatedUser.userFavoriteTeam,
                userEmail: updatedUser.userEmail,
                userPhone: updatedUser.userPhone,
                userImagePath: updatedUser.userImagePath,
                userImageName: updatedUser.userImageName,
            };

            setUser(newUserContext);
            sessionStorage.setItem("user", JSON.stringify(newUserContext));

            alert('정보가 성공적으로 수정되었습니다!');
            onClose();
        } catch (err) {
            console.error('프로필 업데이트 실패:', err);
            const errorMessage = err.response?.data?.message || '정보 수정에 실패했습니다. 다시 시도해주세요.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="edit-profile-modal">
                <h2>내 정보 수정</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group profile-image-group">
                        <label htmlFor="userProfileImage">프로필 이미지</label>
                        <div className="profile-image-preview">
                            {formData.currentProfileImageUrl ? (
                                <img src={formData.currentProfileImageUrl} alt="Profile Preview"/>
                            ) : (
                                <div className="placeholder-image">이미지 없음</div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="userProfileImage"
                            name="userProfileImage"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {formData.currentProfileImageUrl && (
                            <button
                                type="button"
                                onClick={handleDeleteImage}
                                disabled={loading}
                                className="delete-image-btn"
                            >
                                이미지 삭제
                            </button>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="userNickname">닉네임</label>
                        <input
                            type="text"
                            id="userNickname"
                            name="userNickname"
                            value={formData.userNickname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userName">성명</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userFavoriteTeam">응원하는 팀</label>
                        <select
                            id="userFavoriteTeam"
                            name="userFavoriteTeam"
                            value={formData.userFavoriteTeam}
                            onChange={handleChange}
                        >
                            <option value="">-- 팀 선택 --</option>
                            {teams.map((team) => (
                                <option key={team.teamId} value={team.teamName}>
                                    {team.teamName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="userEmail">이메일</label>
                        <input
                            type="email"
                            id="userEmail"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userPhone">전화번호</label>
                        <input
                            type="tel"
                            id="userPhone"
                            name="userPhone"
                            value={formData.userPhone}
                            onChange={handleChange}
                            placeholder="010-1234-5678"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? '저장 중...' : '저장'}
                        </button>
                        <button type="button" onClick={onClose} disabled={loading}>
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfilePage;