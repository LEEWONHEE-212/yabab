// src/components/Admin/UserDetailModal.jsx (최종 수정 - 물리적 삭제 API에 맞춤, 이름/최종로그인 제거)
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './Modal.css'; // 모달 스타일 시트

const UserDetailModal = ({ user, onClose, getUserRoleText, fetchUsers }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailedUser, setDetailedUser] = useState(null);

    const { user: adminUser } = useContext(UserContext);

    useEffect(() => {
        const fetchUserDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:18090/api/admin/users/${user.userId}`, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` }
                });
                setDetailedUser(response.data);
                console.log("Fetched detailed user for modal:", response.data);
            } catch (err) {
                console.error("Failed to fetch user detail:", err);
                setError("회원 상세 정보를 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, [user.userId, adminUser]);

    // 회원 계정 물리적 삭제 처리
    const handleDeleteUser = async () => {
        if (!detailedUser) return;

        if (window.confirm(`정말로 회원 ID: ${detailedUser.userId} (${detailedUser.userNickname}) 님을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다!`)) {
            try {
                await axios.delete(`http://localhost:18090/api/admin/users/${detailedUser.userId}`, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` }
                });
                alert("회원이 성공적으로 삭제되었습니다.");
                fetchUsers(); // 부모 컴포넌트의 목록을 새로고침
                onClose(); // 모달 닫기
            } catch (err) {
                console.error("Failed to delete user:", err);
                alert("회원 삭제에 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            }
        }
    };

    // 로딩 및 에러 처리
    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>회원 상세 정보를 불러오는 중...</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p className="error-message">{error}</p>
                <button onClick={onClose} className="action-button close-button-in-modal">닫기</button>
            </div>
        </div>
    );
    if (!detailedUser) return null; // 상세 유저 정보가 없으면 렌더링하지 않음

    return (
        <div className="modal-overlay">
            <div className="modal-content admin-detail-modal">
                <div className="modal-header">
                    <h2>회원 상세 정보: {detailedUser.userNickname} ({detailedUser.userId})</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>ID:</strong> {detailedUser.userId}</p>
                    {/* <p><strong>이름:</strong> {detailedUser.userName || 'N/A'}</p>  <- 이름 필드 제거 */}
                    <p><strong>닉네임:</strong> {detailedUser.userNickname}</p>
                    <p><strong>이메일:</strong> {detailedUser.userEmail}</p>
                    <p><strong>역할:</strong> {getUserRoleText(detailedUser.userRole)}</p>
                    <p><strong>가입일:</strong> {detailedUser.userJoindate ? new Date(detailedUser.userJoindate).toLocaleDateString() : 'N/A'}</p>
                    {/* <p><strong>최종 로그인:</strong> {detailedUser.userLastlogin ? new Date(detailedUser.userLastlogin).toLocaleString() : 'N/A'}</p>  <- 최종 로그인 필드 제거 */}


                    {/* 사장님일 경우 사업장 정보 표시 (백엔드에서 businessInfo를 제공한다고 가정) */}
                    {detailedUser.userRole === 2 && detailedUser.businessInfo && (
                        <div className="detail-section">
                            <h3>사업장 정보 (사장님)</h3>
                            <p><strong>사업자 등록번호:</strong> {detailedUser.businessInfo.businessRegistrationNumber || 'N/A'}</p>
                            <p><strong>가게 이름:</strong> {detailedUser.businessInfo.storeName || 'N/A'}</p>
                            <p><strong>가게 주소:</strong> {detailedUser.businessInfo.storeAddress || 'N/A'}</p>
                            {/* 기타 사업장 정보 필드가 있다면 여기에 추가 */}
                        </div>
                    )}

                    <div className="detail-section delete-section">
                        <h3>계정 영구 삭제</h3>
                        <p>주의: 계정을 영구적으로 삭제하면 모든 데이터가 사라지며 복구할 수 없습니다. 신중하게 진행해주세요.</p>
                        <button
                            onClick={handleDeleteUser}
                            className="action-button delete-button full-width-button"
                        >
                            계정 영구 삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;