// src/pages/Admin/UserManagement.jsx (최종 수정)
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import UserDetailModal from './UserDetailModal'; // 경로 확인해주세요

// AdminPage.css를 임포트하여 공통 스타일과 새롭게 변경된 클래스 이름들을 사용합니다.
import './Admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('userNickname');
    const [filterRole, setFilterRole] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10); // 기본값 10

    const { user: adminUser } = useContext(UserContext);

    // 회원 목록을 비동기로 불러오는 함수
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                // searchTerm과 searchType을 함께 사용하도록 복원
                ...(searchTerm && { searchTerm: searchTerm }),
                ...(searchTerm && { searchType: searchType }),
                ...(filterRole !== '' && { userRole: parseInt(filterRole) }),
                sortBy: 'userJoindate', // 기본 정렬 기준
                sortDirection: 'desc' // 기본 정렬 방향
            };

            const response = await axios.get('http://localhost:18090/api/admin/users', {
                params: params,
                // 백엔드 API가 인증 토큰을 요구할 경우 아래 주석을 해제하고 토큰을 추가하세요.
                // headers: { Authorization: `Bearer ${adminUser.token}` }
            });

            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
            setCurrentPage(response.data.pageNumber);
            console.log("Fetched users:", response.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("회원 목록을 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            setUsers([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, searchType, filterRole, adminUser]); // searchType 의존성 추가

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 회원 역할 코드를 텍스트로 변환하는 헬퍼 함수 (DTO에도 정의되어 있음)
    const getUserRoleText = (roleCode) => {
        switch (roleCode) {
            case 0: return '관리자';
            case 1: return '일반 사용자';
            case 2: return '사장님';
            default: return '알 수 없음';
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // 검색 시 첫 페이지로 이동
        fetchUsers();
    };

    const openUserDetailModal = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const closeUserDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedUser(null);
        fetchUsers(); // 모달 닫을 때 목록 새로고침
    };

    // 페이징 버튼 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPagination = () => {
        const pages = [];
        // totalPages가 0일 때 (데이터가 없을 때) 페이징 버튼을 렌더링하지 않도록 조건 추가
        if (totalPages === 0) return null; 

        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={currentPage === i ? 'active-page' : ''}
                >
                    {i + 1}
                </button>
            );
        }
        return (
            // 클래스 이름 변경: pagination -> admin-page-pagination
            <div className="admin-page-pagination"> 
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                    이전
                </button>
                {pages}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                    다음
                </button>
            </div>
        );
    };

    if (loading) return <p>회원 목록을 불러오는 중...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        // 클래스 이름 변경: management-section -> admin-page-management-section
        <div className="admin-page-management-section">
            {/* 클래스 이름 변경: section-title -> admin-page-section-title */}
            <h2 className="admin-page-section-title">회원 관리</h2>

            {/* 검색 및 필터링 폼 - searchType 드롭다운 복원 */}
            {/* 클래스 이름 변경: search-filter-form -> admin-page-search-filter-form */}
            <form onSubmit={handleSearchSubmit} className="admin-page-search-filter-form">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="userNickname">닉네임</option>
                    <option value="userId">아이디</option>
                    <option value="userEmail">이메일</option>
                    <option value="userName">이름</option>
                </select>
                
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">모든 역할</option>
                    <option value="0">관리자</option>
                    <option value="1">일반 사용자</option>
                    <option value="2">사장님</option>
                </select>

                <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* 클래스 이름 변경: search-button -> admin-page-search-button */}
                <button type="submit" className="admin-page-search-button">검색</button>
            </form>

            {/* 회원 목록 테이블 */}
            {/* 클래스 이름 변경: table-wrapper -> admin-page-table-wrapper */}
            <div className="admin-page-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>닉네임</th>
                            <th>이메일</th>
                            <th>역할</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                {/* 클래스 이름 변경: no-data -> admin-page-no-data */}
                                <td colSpan="6" className="admin-page-no-data">조건에 맞는 회원이 없습니다.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.userId}>
                                    <td>{u.userId}</td>
                                    <td>{u.userNickname}</td>
                                    <td>{u.userEmail}</td>
                                    <td>{getUserRoleText(u.userRole)}</td>
                                    <td>{u.userJoindate ? new Date(u.userJoindate).toLocaleDateString() : 'N/A'}</td>
                                    {/* 클래스 이름 변경: actions-cell -> admin-page-actions-cell */}
                                    <td className="admin-page-actions-cell">
                                        {/* action-button과 그 파생 클래스들은 AdminPage.css에 공통으로 유지 */}
                                        <button className="action-button detail-button" onClick={() => openUserDetailModal(u)}>상세</button>
                                        {/* 목록에서의 삭제 버튼 제거 유지 */}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 컨트롤 */}
            {totalPages > 0 && renderPagination()}
            {/* 클래스 이름 변경: total-elements-info -> admin-page-total-elements-info */}
            <p className="admin-page-total-elements-info">총 회원 수: {totalElements}명</p>

            {/* 회원 상세 모달 */}
            {isDetailModalOpen && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={closeUserDetailModal}
                    getUserRoleText={getUserRoleText}
                    fetchUsers={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;