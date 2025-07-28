import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './EditProfilePage.css'; // Ensure this CSS file is correctly linked

function EditProfilePage({ isOpen, onClose }) {
    const { user, setUser } = useContext(UserContext);

    const [formData, setFormData] = useState({
        userNickname: '',
        userName: '',
        userFavoriteTeam: '',
        userEmail: '',
        userPhone: '',
        userImagePath: '', // Added to store current image path for submission
        userImageName: '', // Added to store current image name for submission
        currentProfileImageUrl: '', // For displaying the image in the frontend
    });

    const [imageFile, setImageFile] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            // ⭐ 이미지 URL 구성 로직 수정 시작 ⭐
            let initialImagePath = user.userImagePath;
            if (initialImagePath === '/profile_images/') {
                initialImagePath = '/uploads/';
            } else if (!initialImagePath) {
                initialImagePath = ''; // 경로가 없을 경우 빈 문자열로 설정
            }

            const initialImageUrl =
                user.userImageName
                    ? `http://localhost:18090${initialImagePath}${user.userImageName}`
                    : '';
            // ⭐ 이미지 URL 구성 로직 수정 끝 ⭐

            setFormData({
                userNickname: user.userNickname || '',
                userName: user.userName || '',
                userFavoriteTeam: user.userFavoriteTeam || '',
                userEmail: user.userEmail || '',
                userPhone: user.userPhone || '',
                userImagePath: user.userImagePath || '', // Initialize with existing path (DB 값 그대로 유지)
                userImageName: user.userImageName || '', // Initialize with existing name (DB 값 그대로 유지)
                currentProfileImageUrl: initialImageUrl, // 수정된 URL 사용
            });
            setImageFile(null);
            setError(null);
            setLoading(false);
            fetchTeams();
        }
    }, [user, isOpen]);

    const fetchTeams = async () => {
        try {
            // ⭐ 이 URL이 백엔드 MyPageEditController의 /api/mypage/teams 와 일치합니다. ⭐
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
            setFormData(prev => ({
                ...prev,
                currentProfileImageUrl: URL.createObjectURL(file),
                userImagePath: '', // 새 이미지 업로드 시 기존 경로/이름 초기화
                userImageName: ''
            }));
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
            // ⭐ 이 URL이 백엔드 MyPageEditController의 /api/mypage/{userId}/profile/image 와 일치합니다. ⭐
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

            setFormData(prev => ({
                ...prev,
                currentProfileImageUrl: '',
                userImagePath: null,
                userImageName: null
            }));
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

            formDataToSend.append('userNickname', formData.userNickname);
            formDataToSend.append('userName', formData.userName);
            formDataToSend.append('userEmail', formData.userEmail);
            formDataToSend.append('userPhone', formData.userPhone);
            formDataToSend.append('userFavoriteTeam', formData.userFavoriteTeam);

            if (imageFile) {
                formDataToSend.append('profileImage', imageFile);
            } else {
                // 이미지가 변경되지 않았거나 삭제된 경우, 기존 경로/이름을 백엔드로 다시 보냅니다.
                // 백엔드 서비스에서 이 값을 기반으로 DB 업데이트 여부를 결정합니다.
                formDataToSend.append('userImagePath', formData.userImagePath || '');
                formDataToSend.append('userImageName', formData.userImageName || '');
            }

            const token = sessionStorage.getItem('token');

            // ⭐ 이 URL이 백엔드 MyPageEditController의 /api/mypage/profile/{userId} 와 일치해야 합니다. ⭐
            const response = await axios.put(
                `http://localhost:18090/api/mypage/profile/${userId}`,
                formDataToSend,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
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
                                <img src={formData.currentProfileImageUrl} alt="프로필 이미지 미리보기"/>
                            ) : (
                                <div className="placeholder-image">이미지 없음</div>
                            )}
                        </div>
                        <div className="file-input-controls">
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
