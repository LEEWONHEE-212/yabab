import React, { useEffect, useState } from "react";
import GameScheduleList from './GameScheduleList';
import { fetchGameSchedules } from '../../api/gameApi';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import './GameScheduleSection.css';
import { ko } from 'date-fns/locale'

const GameScheduleSection = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());    //  선택한 날짜
    const [games, setGames] = useState([]);     //  해당 날짜 경기 목록

    //  날짜 변경될 때마다 경기일정 다시 가져오기
    useEffect(() => {
        const loadGames = async() => {
            const result = await fetchGameSchedules(dayjs(selectedDate).format('YYYY-MM-DD'));
            setGames(result);
        };
        loadGames();
    }, [selectedDate]); 

    //  날짜 하루 전/후 이동
    const handlePrevDay = () => {
        setSelectedDate(prev => dayjs(prev).subtract(1, 'day').toDate());
    };

    const handleNextDay = () => {
        setSelectedDate(prev => dayjs(prev).add(1, 'day').toDate());
    };

    const handleToday = () => {
    setSelectedDate(new Date()); // 오늘 날짜로 설정
};

    return(
        <div className="calender-container">
            <div className="calendar-header">
                <button className="recent-btn" onClick={handleToday}>최근</button>
                <button className="nav-btn" onClick={handlePrevDay}>◀</button>
                <strong className="current-data">{dayjs(selectedDate).format('YYYY.MM.DD')}</strong>
                <button className="nav-btn" onClick={handleNextDay}>▶</button>

                <DatePicker
                    locale={ko}
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dataFormat="yyyy-MM-dd"
                    customInput={<button className="calendar-btn">📅</button>}
                    calendarClassName="calendar-popup"
                    dayClassName={(data) =>
                        dayjs(data).isSame(dayjs(), 'day') ? 'today' : ''
                    }
                />
            </div>

            <GameScheduleList
                date={dayjs(selectedDate).format('YYYY.MM.DD')}
                games={games}
            />
        </div>
    );
};

export default GameScheduleSection;