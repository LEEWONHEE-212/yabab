import { useParams, Routes, Route } from "react-router-dom";
// import TeamHeader from "./TeamHeader";
import FeedBoardSection from "../components/feed/FeedBoardSection";
import FeedWriteForm from "../components/feed/FeedWriteForm";

const FeedPage = () => {
    return (
        <Routes>
        {/* <TeamHeader /> */}
            <Route path="/:teamId/list" element={<FeedBoardSection />} />
            <Route path="/:teamId/write" element={<FeedWriteForm />} />
        </Routes>
    );
};

export default FeedPage;