import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import TemplateSelection from './pages/TemplateSelection'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TemplateSelection />} />
        <Route path="/editor" element={<HomePage />} />
      </Routes>
    </HashRouter>
  )
}
