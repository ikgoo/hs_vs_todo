import React, { useState } from 'react';
import ProjectButton from './ProjectButton';
import AddProjectForm from './AddProjectForm';
import { useVSCode } from '../../hooks/useVSCode';
import '../../styles/ProjectList.css';

const ProjectList = ({ projects, activeProjectId, onProjectSelect }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const vscode = useVSCode();

    const handleAddProject = (name) => {
        vscode.postMessage({
            command: 'addProject',
            name: name
        });
        setShowAddForm(false);
    };

    const handleEditSubmit = (newName) => {
        vscode.postMessage({
            command: 'editProject',
            projectId: editingProject.id,
            newName: newName
        });
        setEditingProject(false);
    };

    return (
        <div className="project-section">
            <div className="project-header">
                <div className="project-buttons">
                    {projects.map((project, index) => (
                        <ProjectButton
                            key={index}
                            project={project}
                            projectId={index}
                            isActive={index === activeProjectId}
                            onClick={() => onProjectSelect(index)}
                            onEdit={() => setEditingProject({ id: index, name: project.name })}
                        />
                    ))}
                </div>
                {!showAddForm && !editingProject && (
                    <button 
                        className="add-project-button"
                        onClick={() => setShowAddForm(true)}
                    >
                        + New Project
                    </button>
                )}
            </div>
            {showAddForm && (
                <AddProjectForm
                    onSubmit={handleAddProject}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
            {editingProject && (
                <AddProjectForm
                    onClose={() => setEditingProject(null)}
                    onSubmit={handleEditSubmit}
                    editMode={true}
                    initialValue={editingProject.name}
                />
            )}
        </div>
    );
};

export default ProjectList; 