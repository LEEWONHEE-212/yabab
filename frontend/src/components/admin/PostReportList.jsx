// src/pages/Admin/PostReportList.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'; // UserContext 경로를 프로젝트에 맞게 조정해주세요.
import ReportDetailModal from './ReportDetailModal'; // ReportDetailModal 컴포넌트 경로를 프로젝트에 맞게 조정해주세요.

const PostReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('postTitle'); // 검색 기준: postTitle, postContent, reporterEmail, reportedUserEmail
    const [filterStatus, setFilterStatus] = useState(''); // 상태 필터: '', 0(대기), 1(수락), 2(거절)
    const [selectedReport, setSelectedReport] = useState(null); // 상세 정보를 볼 신고 객체
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // 상세 모달 열림/닫힘 상태

    const { user: adminUser } = useContext(UserContext);

    // 게시물 신고 목록을 비동기로 불러오는 함수
    const fetchPostReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: 0,
                size: 100,
                ...(searchTerm && { [searchType]: searchTerm }),
                ...(filterStatus && { status: parseInt(filterStatus) }),
            };

            const response = await axios.get('http://localhost:18090/api/admin/reports/posts', {
                params: params,
                // headers: { Authorization: `Bearer ${adminUser.token}` }
            });
            setReports(response.data.content || response.data);
            console.log("Fetched post reports:", response.data); // 디버깅용 로그
        } catch (err) {
            console.error("Failed to fetch post reports:", err);
            setError("게시물 신고 목록을 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, searchType, filterStatus, adminUser]);

    // 컴포넌트 마운트 및 필터/검색 조건 변경 시 목록 다시 불러오기
    useEffect(() => {
        fetchPostReports();
    }, [fetchPostReports]);

    // 신고 상태 코드를 텍스트로 변환하는 헬퍼 함수
    const getReportStatusText = (statusCode) => {
        switch (statusCode) {
            case 0: return '대기';
            case 1: return '처리 완료 (수락)';
            case 2: return '처리 완료 (거절)';
            default: return '알 수 없음';
        }
    };

    // 검색 버튼 클릭 또는 Enter 시
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPostReports();
    };

    // 신고 상세 모달 열기
    const openReportDetailModal = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    // 신고 상세 모달 닫기
    const closeReportDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReport(null);
        fetchPostReports(); // 상세 처리 후 목록 새로고침
    };

    if (loading) return <p>게시물 신고 목록을 불러오는 중...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="management-section">
            <h2 className="section-title">게시물 신고 목록</h2>

            {/* 검색 및 필터링 폼 */}
            <form onSubmit={handleSearchSubmit} className="search-filter-form">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="postTitle">게시물 제목</option>
                    <option value="postContent">게시물 내용</option>
                    <option value="reporterEmail">신고자 이메일</option>
                    <option value="reportedUserEmail">대상 회원 이메일</option>
                </select>
                <input
                    type="text"
                    placeholder="검색어 입력..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">모든 상태</option>
                    <option value="0">대기</option>
                    <option value="1">처리 완료 (수락)</option>
                    <option value="2">처리 완료 (거절)</option>
                </select>
                <button type="submit" className="search-button">검색</button>
            </form>

            {/* 게시물 신고 목록 테이블 */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>신고 ID</th>
                            <th>게시물 ID</th>
                            <th>신고자 ID</th>
                            <th>대상 회원 ID</th>
                            <th>신고 사유</th>
                            <th>신고일</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">조건에 맞는 신고된 게시물이 없습니다.</td>
                            </tr>
                        ) : (
                            reports.map((p) => (
                                <tr key={p.reportId}>
                                    <td>{p.reportId}</td>
                                    <td>{p.postId}</td>
                                    <td>{p.reporterId}</td>
                                    <td>{p.reportedUserId}</td>
                                    <td>{p.reportReason}</td>
                                    {/* 날짜 형식에 따라 new Date() 처리 필요 */}
                                    <td>{p.reportDate ? new Date(p.reportDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{getReportStatusText(p.status)}</td>
                                    <td className="actions-cell">
                                        {/* 신고 상세 모달 열기 버튼 */}
                                        <button className="action-button detail-button" onClick={() => openReportDetailModal(p)}>상세</button>
                                        {/* 추가적으로 목록에서 바로 처리하는 버튼을 원하면 여기에 추가할 수 있습니다. */}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 신고 상세 모달 */}
            {isDetailModalOpen && selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    reportType="post" // 이 모달이 게시물 신고용임을 명시
                    onClose={closeReportDetailModal}
                    getReportStatusText={getReportStatusText}
                    fetchReports={fetchPostReports} // 모달 내에서 처리 후 목록 새로고침
                />
            )}
        </div>
    );
};

export default PostReportList;