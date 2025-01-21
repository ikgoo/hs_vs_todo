import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/index.css';
import { getVSCodeApi } from './hooks/useVSCode';

// VSCode API를 한 번만 초기화
const vscode = getVSCodeApi();

// React 18 방식으로 렌더링
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App initialData={window.initialData} />); 