import React, { useState } from 'react';
import ProjectList from './ProjectList/ProjectList';
import TaskBoard from './TaskBoard/TaskBoard';

const App = ({ initialData }) => {
    const [projects, setProjects] = useState(initialData);
    const [activeProjectId, setActiveProjectId] = useState(0);

    return (
        <div className="app">
            <ProjectList 
                projects={projects}
                activeProjectId={activeProjectId}
                onProjectSelect={setActiveProjectId}
            />
            <TaskBoard 
                project={projects[activeProjectId]}
                projectId={activeProjectId}
            />
        </div>
    );
};

export default App; 