import { Routes, Route } from "react-router-dom";
// import TeamHeader from "./TeamHeader";
import FeedBoardSection from "../components/feed/FeedBoardSection";
import FeedWriteForm from "../components/feed/FeedWriteForm";
import FeedDetailForm from "../components/feed/FeedDetailForm";
import FeedMain from "../components/feed/FeedMain";
import FeedEditForm from "../components/feed/FeedEditForm";
import { useState } from "react";

const FeedPage = () => {
    const [forceReload, setForceReload] = useState(false);
    
    return (
        <Routes>
            <Route path="/main" element={<FeedMain />} />
            <Route path="/:teamId/list" element={<FeedBoardSection />} />
            <Route path="/:teamId/write" element={<FeedWriteForm />} />
            <Route path="/:teamId/view/:feedId" element={<FeedDetailForm setForceReload={setForceReload} />} />
            <Route path="/edit/:feedId" element={<FeedEditForm />} />
        </Routes>
    );
};

export default FeedPage;