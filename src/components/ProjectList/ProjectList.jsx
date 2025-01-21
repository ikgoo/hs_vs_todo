import React, { useState } from 'react';
import ProjectButton from './ProjectButton';
import AddProjectForm from './AddProjectForm';
import { useVSCode } from '../../hooks/useVSCode';

const ProjectList = ({ projects, activeProjectId, onProjectSelect }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const vscode = useVSCode();

    const handleAddProject = (name) => {
        vscode.postMessage({
            command: 'addProject',
            name
        });
        setShowAddForm(false);
    };

    return (
        <div className="project-section">
            <div className="project-header">
                <div className="project-buttons">
                    {projects.map((project, index) => (
                        <ProjectButton
                            key={index}
                            project={project}
                            isActive={index === activeProjectId}
                            onClick={() => onProjectSelect(index)}
                        />
                    ))}
                </div>
                <button 
                    className="add-project-button"
                    onClick={() => setShowAddForm(true)}
                >
                    + 새 프로젝트
                </button>
            </div>
            {showAddForm && (
                <AddProjectForm
                    onSubmit={handleAddProject}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
};

export default ProjectList; 