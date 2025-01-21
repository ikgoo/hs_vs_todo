import React, { useState } from 'react';
import { useVSCode } from '../../hooks/useVSCode';

const ProjectButton = ({ project, projectId, isActive, onClick, onEdit }) => {
    const [isHovered, setIsHovered] = useState(false);
    const vscode = useVSCode();

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit();  // 다시 수정 폼 표시로 변경
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        vscode.postMessage({
            command: 'deleteProject',
            projectId: projectId,
            projectName: project.name
        });
    };

    return (
        <button 
            className={`project-button ${isActive ? 'active' : ''}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="project-name">{project.name}</span>
            {isHovered && (
                <div className="project-button-actions">
                    <span 
                        className="project-button-icon edit"
                        onClick={handleEdit}
                        title="프로젝트 수정"
                    >
                        ✏️
                    </span>
                    <span 
                        className="project-button-icon delete"
                        onClick={handleDelete}
                        title="프로젝트 삭제"
                    >
                        🗑️
                    </span>
                </div>
            )}
        </button>
    );
};

export default ProjectButton; 