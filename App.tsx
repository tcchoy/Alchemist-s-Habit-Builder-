
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HabitManager from './pages/HabitManager';
import CreateHabit from './pages/CreateHabit';
import Journal from './pages/Journal';
import Harvesting from './pages/Harvesting';
import QuestBoard from './pages/QuestBoard';
import Shop from './pages/Shop';
import CalendarReview from './pages/CalendarReview';

const App: React.FC = () => {
  return (
    <GameProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<HabitManager />} />
            <Route path="/create" element={<CreateHabit />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/harvest" element={<Harvesting />} />
            <Route path="/quests" element={<QuestBoard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/calendar" element={<CalendarReview />} />
          </Routes>
        </Layout>
      </Router>
    </GameProvider>
  );
};

export default App;
