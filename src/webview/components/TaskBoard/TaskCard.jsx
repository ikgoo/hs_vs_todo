import React, { useState } from 'react';
import { useVSCode } from '../../hooks/useVSCode';

const TaskCard = ({ 
    task, 
    status, 
    index, 
    projectId, 
    onDragStart, 
    onDragEnd, 
    onDragOver, 
    onDragLeave, 
    onDrop, 
    isDragOver,
    onEdit,
    onDelete
}) => {
    const [showActions, setShowActions] = useState(false);

    const handleEdit = () => {
        onEdit(task, status, index);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(task, status, index);
    };

    return (
        <div 
            className={`task-card ${isDragOver ? 'drag-over' : ''}`}
            draggable="true"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="task-card-title">{task.title}</div>
            {showActions && (
                <div className="task-card-actions">
                    <span 
                        className="task-card-icon edit"
                        onClick={handleEdit}
                        title="수정"
                    >
                        ✎
                    </span>
                    <span 
                        className="task-card-icon delete"
                        onClick={handleDelete}
                        title="삭제"
                    >
                        ×
                    </span>
                </div>
            )}
        </div>
    );
};

export default TaskCard; 