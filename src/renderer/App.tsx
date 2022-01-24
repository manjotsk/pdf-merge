import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'antd/dist/antd.css';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import TreeData from './TreeData';

const { Dragger } = Upload;

const Hello = () => {
  const props = {
    name: 'file',
    multiple: true,
    onChange(info) {
      console.log(info);
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

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
