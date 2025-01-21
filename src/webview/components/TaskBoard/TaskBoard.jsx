import React, { useState, useEffect } from 'react';
import { useVSCode } from '../../hooks/useVSCode';
import '../../styles/TaskBoard.css';
import AddTaskForm from './AddTaskForm';
import TaskCard from './TaskCard';

const TaskBoard = ({ project, projectId, onUpdateTask }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [dragOverStatus, setDragOverStatus] = useState(null);
    const vscode = useVSCode();

    const handleAddTask = (taskData) => {
        vscode.postMessage({
            command: 'addTask',
            projectId: projectId,
            ...taskData
        });
    };

    const handleDragStart = (e, task, status, index) => {
        setDraggedTask({
            title: task.title,
            status: status,
            index: index
        });
        e.dataTransfer.setData('text/plain', '');
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDraggedTask(null);
        setDragOverIndex(null);
        setDragOverStatus(null);
    };

    const handleDragOver = (e, status, index) => {
        e.preventDefault();
        if (draggedTask) {
            e.dataTransfer.dropEffect = 'move';
            setDragOverIndex(index);
            setDragOverStatus(status);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
        setDragOverStatus(null);
    };

    const handleDrop = (e, newStatus, newIndex) => {
        e.preventDefault();
        setDragOverIndex(null);
        
        if (!draggedTask) return;

        // 같은 상태 내에서의 이동
        if (draggedTask.status === newStatus && draggedTask.index !== newIndex) {
            vscode.postMessage({
                command: 'reorderTask',
                projectId: projectId,
                status: newStatus,
                oldIndex: draggedTask.index,
                newIndex: newIndex
            });
        }
        // 다른 상태로의 이동
        else if (draggedTask.status !== newStatus) {
            vscode.postMessage({
                command: 'moveTask',
                projectId: projectId,
                taskTitle: draggedTask.title,
                oldStatus: draggedTask.status,
                newStatus: newStatus,
                newIndex: newIndex
            });
        }
    };

    // 빈 영역에 대한 드롭 핸들러 추가
    const handleColumnDrop = (e, newStatus) => {
        e.preventDefault();
        if (!draggedTask) return;

        // 다른 상태로의 이동일 때
        if (draggedTask.status !== newStatus) {
            vscode.postMessage({
                command: 'moveTask',
                projectId: projectId,
                taskTitle: draggedTask.title,
                oldStatus: draggedTask.status,
                newStatus: newStatus,
                newIndex: project.tasks[newStatus].length  // 맨 끝에 추가
            });
        }
    };

    // 웹뷰 메시지 수신 핸들러 추가
    useEffect(() => {
        const messageHandler = (event) => {
            const message = event.data;
            switch (message.command) {
                case 'showEditTaskForm':
                    setEditTask({
                        task: message.task,
                        status: message.status,
                        taskIndex: message.taskIndex
                    });
                    break;
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    const handleEditClick = (task, status, index) => {
        setEditTask({
            task,
            status,
            taskIndex: index
        });
    };

    const handleEditTask = (updatedTask) => {
        if (editTask) {
            const taskToUpdate = {
                title: updatedTask.title,
                details: updatedTask.properties
            };

            onUpdateTask(projectId, editTask.status, editTask.taskIndex, taskToUpdate);
            setEditTask(null);
        }
    };

    const handleDeleteTask = (task, status, index) => {
        vscode.postMessage({
            command: 'deleteTask',
            projectId,
            status,
            taskIndex: index,
            taskTitle: task.title
        });
    };

    if (!project) return null;

    return (
        <>
            <div className="task-content">
                {['planned', 'waiting', 'inProgress', 'completed'].map(status => (
                    <div 
                        key={status} 
                        className="task-list" 
                        data-status={status}
                        onDragOver={(e) => handleDragOver(e, status, null)}
                        onDrop={(e) => handleColumnDrop(e, status)}
                    >
                        <div className="task-list-header">
                            <span className="task-list-title">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            {status === 'planned' && (
                                <button 
                                    className="add-task-button"
                                    onClick={() => setShowAddForm(true)}
                                >
                                    + 추가
                                </button>
                            )}
                        </div>
                        <div className="task-list-content">
                            {project.tasks[status].map((task, index) => (
                                <TaskCard
                                    key={index}
                                    task={task}
                                    status={status}
                                    index={index}
                                    projectId={projectId}
                                    isDragOver={dragOverStatus === status && dragOverIndex === index}
                                    onDragStart={(e) => handleDragStart(e, task, status, index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, status, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, status, index)}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <AddTaskForm
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSubmit={handleAddTask}
                editMode={false}
            />
            <AddTaskForm
                isOpen={editTask}
                onClose={() => setEditTask(null)}
                onSubmit={handleEditTask}
                editMode={true}
                initialData={editTask?.task}
            />
        </>
    );
};

export default TaskBoard; 