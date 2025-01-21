import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const INITIAL_FORM_STATE = {
    title: '',
    properties: {
        plannedStartDate: '',
        plannedEndDate: '',
        assignee: '',
        priority: '',
        note: ''
    }
};

const AddTaskForm = ({ isOpen, onClose, onSubmit, editMode = false, initialData = null }) => {
    const [taskData, setTaskData] = useState(INITIAL_FORM_STATE);

    // 수정 모드일 때 초기 데이터 설정
    useEffect(() => {
        if (isOpen) {
            if (editMode && initialData) {
                setTaskData({
                    title: initialData.title || '',
                    properties: {
                        plannedStartDate: initialData.details?.plannedStartDate || '',
                        plannedEndDate: initialData.details?.plannedEndDate || '',
                        assignee: initialData.details?.assignee || '',
                        priority: initialData.details?.priority || '',
                        note: initialData.details?.note || ''
                    }
                });
            } else {
                setTaskData(INITIAL_FORM_STATE);
            }
        }
    }, [isOpen, editMode, initialData]);

    const handleSubmit = () => {
        if (taskData.title.trim()) {
            const cleanProperties = Object.fromEntries(
                Object.entries(taskData.properties)
                    .filter(([_, value]) => value && value.trim() !== '')
            );

            const submittedData = {
                title: taskData.title.trim(),
                type: 'task',
                properties: cleanProperties
            };

            onSubmit(submittedData);
            setTaskData(INITIAL_FORM_STATE);  // 폼 초기화
            onClose();
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel}>
            <div className="add-task-form">
                <h2>{editMode ? 'Edit Task' : 'Add New Task'}</h2>
                <div className="form-group">
                    <label>Title *</label>
                    <textarea
                        value={taskData.title || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            title: e.target.value
                        })}
                        placeholder="Enter task title"
                        rows={3}
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label>Planned Start Date</label>
                    <input
                        type="date"
                        value={taskData.properties.plannedStartDate || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                plannedStartDate: e.target.value
                            }
                        })}
                    />
                </div>
                <div className="form-group">
                    <label>Planned End Date</label>
                    <input
                        type="date"
                        value={taskData.properties.plannedEndDate || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                plannedEndDate: e.target.value
                            }
                        })}
                    />
                </div>
                <div className="form-group">
                    <label>Assignee</label>
                    <input
                        type="text"
                        value={taskData.properties.assignee || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                assignee: e.target.value
                            }
                        })}
                        placeholder="Assignee name"
                    />
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <select
                        value={taskData.properties.priority || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                priority: e.target.value
                            }
                        })}
                    >
                        <option value="">Select Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Notes</label>
                    <textarea
                        value={taskData.properties.note || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                note: e.target.value
                            }
                        })}
                        placeholder="Enter additional information"
                        rows={3}
                    />
                </div>
                <div className="form-buttons">
                    <button className="submit-button" onClick={handleSubmit}>
                        {editMode ? 'Update' : 'Save'}
                    </button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddTaskForm; 