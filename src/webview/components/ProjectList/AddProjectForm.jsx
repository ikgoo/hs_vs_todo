import React, { useState, useEffect } from 'react';

const AddProjectForm = ({ initialValue = '', onSubmit, onCancel, isEditing = false }) => {
    const [name, setName] = useState(initialValue);

    useEffect(() => {
        setName(initialValue);
    }, [initialValue]);

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim());
            setName('');
        }
    };

    return (
        <div className="project-input-form active">
            <input
                type="text"
                className="project-input"
                placeholder={isEditing ? "Edit Project Name" : "New Project Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyUp={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                    if (e.key === 'Escape') onCancel();
                }}
                autoFocus
            />
            <div className="project-input-buttons">
                <button className="project-input-button save-project" onClick={handleSubmit}>
                    {isEditing ? 'Update' : 'Save'}
                </button>
                <button className="project-input-button cancel-project" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddProjectForm; 