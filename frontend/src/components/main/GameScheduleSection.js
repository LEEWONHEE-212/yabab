import React, { useEffect, useState } from "react";
import GameScheduleList from './GameScheduleList';
import { fetchGameSchedules } from '../../api/gameApi';

const GameScheduleSection = () => {
    const [date, setDate] = useState(today);    //  선택한 날짜
    const [games, setGames] = useState([]);     //  해당 날짜 경기 목록

    //  날짜 변경될 때마다 경기일정 다시 가져오기
    useEffect(() => {
        const loadGames = async() => {
            try {
                const dateStr = selectedData.format('YYYY-MM-DD');
                const result = await fetchGameSchedules(dataStr);
                setGames(result);   //  성공 시 상태에 저장
            } catch (error) {
                console.error("경기일정 불러오기 실패", error);
                setGames([]);   //  실패 시 빈 목록
            }
        };
        loadGames();
    }, [selectedData]); 

    //  <- 전 날
    const handlePreDay = () => {
        setSelectedDate(prev => prev.subtract(1, 'day'));
    };

    //  -> 다음 날
    const handleNextDay = () => {
        setSelectedDate(prev => prev.add(1, 'day'));
    };

    //  달력에서 선택
    const handleDateChange = (e) => {
        setSelectedDate(dayjs(e.target.value));
    };


    return(
        <div>
            
        </div>
    )
}