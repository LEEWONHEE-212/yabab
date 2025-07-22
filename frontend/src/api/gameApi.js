import axios from 'axios';

export const fetchGameSchedules = async (date) => {
    try {
        const response = await axios.get(
            'http://localhost:18090/api/games',
            {params: { date }}
        );
        return response.data;
    } catch (error) {
        console.error('경기일정 가져오기 실패', error);
        return [];
    }
};