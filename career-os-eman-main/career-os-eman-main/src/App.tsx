import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import SkillsPage from '@/pages/SkillsPage';
import RoadmapPage from '@/pages/RoadmapPage';
import PhasePage from '@/pages/PhasePage';
import TopicPage from '@/pages/TopicPage';
import DashboardPage from '@/pages/DashboardPage';
import ContactPage from '@/pages/ContactPage';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/roadmap/phase/:phase" element={<PhasePage />} />
          <Route path="/roadmap/:slug" element={<TopicPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}