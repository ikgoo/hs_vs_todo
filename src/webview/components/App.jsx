import React, { useState, useEffect } from 'react';
import ProjectList from './ProjectList/ProjectList';
import TaskBoard from './TaskBoard/TaskBoard';
import { useVSCode } from '../hooks/useVSCode';

const App = ({ initialData }) => {
    const [projects, setProjects] = useState(initialData);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const vscode = useVSCode();

    const handleUpdateTask = (projectId, status, taskIndex, updatedTask) => {
        setProjects(prevProjects => {
            const newProjects = [...prevProjects];
            const project = newProjects[projectId];
            if (project) {
                project.tasks[status][taskIndex] = updatedTask;
            }
            return newProjects;
        });

        vscode.postMessage({
            command: 'updateTask',
            projectId,
            status,
            taskIndex,
            updatedTask
        });
    };

    useEffect(() => {
        const messageHandler = event => {
            const message = event.data;
            switch (message.command) {
                case 'updateContent':
                    setProjects(message.data);
                    break;
                case 'editProject':
                    setProjects(prevProjects => {
                        const newProjects = [...prevProjects];
                        newProjects[message.projectId].name = message.newName;
                        return newProjects;
                    });
                    break;
                case 'deleteProject':
                    setProjects(prevProjects => {
                        const newProjects = prevProjects.filter((_, index) => index !== message.projectId);
                        if (activeProjectId === message.projectId) {
                            setActiveProjectId(null);
                        } else if (activeProjectId > message.projectId) {
                            setActiveProjectId(activeProjectId - 1);
                        }
                        return newProjects;
                    });
                    break;
                case 'addTask':
                    setProjects(prevProjects => {
                        const newProjects = [...prevProjects];
                        const project = newProjects[message.projectId];
                        if (project) {
                            project.tasks.planned.push({
                                title: message.title,
                                status: 'planned',
                                details: {}
                            });
                        }
                        return newProjects;
                    });
                    break;
                case 'moveTask':
                    setProjects(prevProjects => {
                        const newProjects = [...prevProjects];
                        const project = newProjects[message.projectId];
                        if (project) {
                            const taskIndex = project.tasks[message.oldStatus]
                                .findIndex(task => task.title === message.taskTitle);
                            if (taskIndex !== -1) {
                                const task = project.tasks[message.oldStatus].splice(taskIndex, 1)[0];
                                task.status = message.newStatus;
                                project.tasks[message.newStatus].push(task);
                            }
                        }
                        return newProjects;
                    });
                    break;
                case 'addProject':
                    setProjects(prevProjects => {
                        return [...prevProjects, {
                            name: message.name,
                            tasks: {
                                planned: [],
                                waiting: [],
                                inProgress: [],
                                completed: []
                            }
                        }];
                    });
                    break;
                case 'showEditTaskForm':
                    window.postMessage(message, '*');
                    break;
                case 'updateTask':
                    setProjects(prevProjects => {
                        const newProjects = [...prevProjects];
                        const project = newProjects[message.projectId];
                        if (project) {
                            project.tasks[message.status][message.taskIndex] = {
                                title: message.updatedTask.title,
                                details: message.updatedTask.details
                            };
                        }
                        return newProjects;
                    });
                    break;
                case 'deleteTask':
                    setProjects(prevProjects => {
                        return prevProjects.map((project, projectIndex) => {
                            if (projectIndex === message.projectId) {
                                return {
                                    ...project,
                                    tasks: {
                                        ...project.tasks,
                                        [message.status]: project.tasks[message.status].filter((_, index) => index !== message.taskIndex)
                                    }
                                };
                            }
                            return project;
                        });
                    });
                    break;
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, []);

    return (
        <div className="app">
            <ProjectList
                projects={projects}
                activeProjectId={activeProjectId}
                onProjectSelect={setActiveProjectId}
            />
            {activeProjectId !== null && projects[activeProjectId] && (
                <div className={`project-content ${activeProjectId !== null ? 'active' : ''}`}>
                    <TaskBoard
                        project={projects[activeProjectId]}
                        projectId={activeProjectId}
                        onUpdateTask={handleUpdateTask}
                    />
                </div>
            )}
        </div>
    );
};

export default App; 