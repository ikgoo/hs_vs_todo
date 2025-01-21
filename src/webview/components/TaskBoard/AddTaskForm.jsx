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
                <h2>{editMode ? '태스크 수정' : '새 태스크 추가'}</h2>
                <div className="form-group">
                    <label>제목 *</label>
                    <textarea
                        value={taskData.title || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            title: e.target.value
                        })}
                        placeholder="태스크 제목을 입력하세요"
                        rows={3}
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label>시작 예정일</label>
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
                    <label>종료 예정일</label>
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
                    <label>담당자</label>
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
                        placeholder="담당자 이름"
                    />
                </div>
                <div className="form-group">
                    <label>우선순위</label>
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
                        <option value="">선택하세요</option>
                        <option value="high">높음</option>
                        <option value="medium">중간</option>
                        <option value="low">낮음</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>비고</label>
                    <textarea
                        value={taskData.properties.note || ''}
                        onChange={(e) => setTaskData({
                            ...taskData,
                            properties: {
                                ...taskData.properties,
                                note: e.target.value
                            }
                        })}
                        placeholder="추가 정보를 입력하세요"
                        rows={3}
                    />
                </div>
                <div className="form-buttons">
                    <button className="submit-button" onClick={handleSubmit}>
                        {editMode ? '수정' : '저장'}
                    </button>
                    <button className="cancel-button" onClick={handleCancel}>취소</button>
                </div>
            </div>
        </Modal>
    );
};

export default AddTaskForm; 