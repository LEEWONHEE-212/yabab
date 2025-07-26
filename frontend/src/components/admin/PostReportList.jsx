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
    // 검색 기준: feedTitle, feedContent, reporterEmail, reportedUserEmail
    const [searchType, setSearchType] = useState('feedTitle');
    // 상태 필터: '', 'PENDING', 'ACCEPTED', 'REJECTED'
    const [filterStatus, setFilterStatus] = useState('');
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
            };

            // 검색 타입에 따라 파라미터 이름 조정
            if (searchTerm) {
                if (searchType === 'feedTitle') {
                    params.feedTitle = searchTerm;
                } else if (searchType === 'feedContent') {
                    params.feedContent = searchTerm;
                } else if (searchType === 'reporterEmail') {
                    params.reporterEmail = searchTerm;
                } else if (searchType === 'reportedUserEmail') {
                    params.reportedUserEmail = searchTerm;
                }
            }

            // 상태 필터 파라미터 (문자열 값으로 변경)
            if (filterStatus) {
                params.status = filterStatus;
            }

            const response = await axios.get('http://192.168.0.47:18090/api/admin/feed-reports', {
                params: params,
                // headers: { Authorization: `Bearer ${adminUser.token}` } // 인증이 필요하다면 주석 해제
            });
            setReports(response.data.content || response.data);
            console.log("Fetched feed reports:", response.data);
        } catch (err) {
            console.error("Failed to fetch feed reports:", err);
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

    // 신고 상태 문자열을 텍스트로 변환하는 헬퍼 함수 (DB 상태값 변경에 맞춤)
    const getReportStatusText = (statusString) => {
        switch (statusString) {
            case 'PENDING': return '대기';
            case 'ACCEPTED': return '처리 완료 (수락)';
            case 'REJECTED': return '처리 완료 (거절)';
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
        <div className="admin-page-management-section"> {/* 클래스명 변경 */}
            <h2 className="admin-page-section-title">게시물 신고 목록</h2> {/* 클래스명 변경 */}

            {/* 검색 및 필터링 폼 */}
            <form onSubmit={handleSearchSubmit} className="admin-page-search-filter-form"> {/* 클래스명 변경 */}
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="feedTitle">게시물 제목</option>
                    <option value="feedContent">게시물 내용</option>
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
                    <option value="PENDING">대기</option>
                    <option value="ACCEPTED">처리 완료 (수락)</option>
                    <option value="REJECTED">처리 완료 (거절)</option>
                </select>
                <button type="submit" className="admin-page-search-button">검색</button> {/* 클래스명 변경 */}
            </form>

            {/* 게시물 신고 목록 테이블 */}
            <div className="admin-page-table-wrapper"> {/* 클래스명 변경 */}
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
                                <td colSpan="8" className="admin-page-no-data">조건에 맞는 신고된 게시물이 없습니다.</td> {/* 클래스명 변경 */}
                            </tr>
                        ) : (
                            reports.map((p) => (
                                <tr key={p.feedReportId}>
                                    <td>{p.feedReportId}</td>
                                    <td>{p.feedId}</td>
                                    <td>{p.reporterUserId}</td>
                                    <td>{p.reportedUserId}</td>
                                    <td>{p.reportReason}</td>
                                    <td>{p.createdDate ? new Date(p.createdDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{getReportStatusText(p.status)}</td>
                                    <td className="admin-page-actions-cell"> {/* 클래스명 변경 */}
                                        {/* 신고 상세 모달 열기 버튼 */}
                                        <button className="action-button detail-button" onClick={() => openReportDetailModal(p)}>상세</button>
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
                    reportType="post"
                    onClose={closeReportDetailModal}
                    getReportStatusText={getReportStatusText}
                    fetchReports={fetchPostReports}
                />
            )}
        </div>
    );
};

export default PostReportList;
