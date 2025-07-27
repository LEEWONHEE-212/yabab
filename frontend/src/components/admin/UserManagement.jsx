// src/pages/Admin/UserManagement.jsx (최종 수정 - 상태 필드 제거)
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
// UserDetailModal의 경로를 components/Admin 폴더 내부로 조정했습니다.
import UserDetailModal from './UserDetailModal'; 

import './Admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('userNickname'); // 기본 검색 타입: 닉네임
    const [filterRole, setFilterRole] = useState('');
    // const [filterStatus, setFilterStatus] = useState(''); // 상태 필터 제거

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10); // 기본값 10

    const { user: adminUser } = useContext(UserContext); // 현재 로그인한 관리자 정보

    // 회원 목록을 비동기로 불러오는 함수
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                ...(searchTerm && { searchTerm: searchTerm }),
                ...(searchTerm && { searchType: searchType }), // searchType도 함께 백엔드로 전달
                // filterRole이 ''이 아닐 때만 userRole 파라미터 추가
                ...(filterRole !== '' && { userRole: parseInt(filterRole) }),
                // ...(filterStatus !== '' && { userStatus: parseInt(filterStatus) }), // filterStatus 제거
                sortBy: 'userJoindate', // 기본 정렬 기준
                sortDirection: 'desc' // 기본 정렬 방향
            };

            const response = await axios.get('http://localhost:18090/api/admin/users', {
                params: params,
                // 백엔드 API가 인증 토큰을 요구할 경우 아래 주석을 해제하고 토큰을 추가하세요.
                // headers: { Authorization: `Bearer ${adminUser.token}` }
            });

            // 관리자 계정(userRole: 0)은 목록에서 제외하고, 페이징 정보는 그대로 사용
            const allUsers = response.data.content || [];
            // 현재 로그인한 관리자 자신(adminUser.userId)을 포함한 모든 관리자(userRole === 0)를 제외합니다.
            const filteredUsers = allUsers.filter(u => u.userRole !== 0); 

            setUsers(filteredUsers);
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
            setCurrentPage(0); // 에러 발생 시 현재 페이지도 초기화
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, searchType, filterRole, adminUser]); // filterStatus 의존성 제거

    // useEffect의 의존성 배열에 fetchUsers 추가 (eslint 경고 방지 및 변경 감지)
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 회원 역할 코드를 텍스트로 변환하는 헬퍼 함수
    const getUserRoleText = (roleCode) => {
        switch (roleCode) {
            case 0: return '관리자'; // 관리자는 0
            case 1: return '일반 사용자';
            case 2: return '사장님';
            default: return '알 수 없음';
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // 검색 시 첫 페이지로 이동
        // fetchUsers는 currentPage 변경에 의해 자동으로 호출됨
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
        if (totalPages === 0) return null; 

        // 현재 페이지를 중심으로 5개 또는 7개 등 일정 범위의 페이징 버튼을 보여주는 로직 추가 가능
        // 여기서는 모든 페이지 버튼을 보여주는 간단한 버전 유지
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
        <div className="admin-page-management-section">
            <h2 className="admin-page-section-title">회원 관리 목록</h2>

            {/* 검색 및 필터링 폼 */}
            <form onSubmit={handleSearchSubmit} className="admin-page-search-filter-form">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="userNickname">닉네임</option>
                    <option value="userId">아이디</option>
                    <option value="userEmail">이메일</option>
                    <option value="userName">이름</option>
                </select>
                
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">모든 역할</option>
                    {/* 관리자(0) 역할은 여기서도 목록 필터에서 숨기는 것이 일반적입니다. */}
                    {/* 필요에 따라 <option value="0">관리자</option>를 추가할 수 있지만, */}
                    {/* 이미 목록에서 제외하고 있으므로 굳이 필터로 넣을 필요는 없을 수 있습니다. */}
                    <option value="1">일반 사용자</option>
                    <option value="2">사장님</option>
                </select>
                <input
                    type="text"
                    placeholder="검색어를 입력하세요..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <button type="submit" className="admin-page-search-button">검색</button>
            </form>

            {/* 회원 목록 테이블 */}
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
                                {/* colSpan 7에서 6으로 변경 */}
                                <td colSpan="6" className="admin-page-no-data">조건에 맞는 회원이 없습니다.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.userId}>
                                    <td>{u.userId}</td>
                                    <td>{u.userNickname}</td>
                                    <td>{u.userEmail}</td>
                                    <td>{getUserRoleText(u.userRole)}</td>
                                    {/* <td>{getUserStatusText(u.userStatus)}</td> 제거 */}
                                    <td>{u.userJoindate ? new Date(u.userJoindate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="admin-page-actions-cell">
                                        <button className="action-button detail-button" onClick={() => openUserDetailModal(u)}>상세</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 컨트롤 */}
            {totalPages > 0 && renderPagination()}
            <p className="admin-page-total-elements-info">총 회원 수: {totalElements}명</p>

            {/* 회원 상세 모달 */}
            {isDetailModalOpen && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={closeUserDetailModal}
                    getUserRoleText={getUserRoleText}
                    // getUserStatusText={getUserStatusText} // 상태 헬퍼 함수 전달 제거
                    fetchUsers={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;