import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'antd/dist/antd.css';
import { Upload } from 'antd';
import TreeData from './TreeData';

const { Dragger } = Upload;

const Hello = () => {
  return <TreeData />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
