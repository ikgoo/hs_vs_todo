const { STATUS_TYPES, STATUS_LABELS } = require('./hs_data');

function generateTaskBoard(project, index) {
    return `
        <div class="project-content ${index === 0 ? 'active' : ''}" 
             id="project-${index}" 
             data-project-id="${index}">
            <div class="task-content">
                ${STATUS_TYPES.map(status => generateTaskList(status, project, index)).join('')}
            </div>
        </div>
    `;
}

function generateTaskList(status, project, projectId) {
    return `
        <div class="task-list" data-status="${status}">
            <div class="task-list-header">
                <span class="task-list-title">${STATUS_LABELS[status]}</span>
                ${status === 'planned' ? 
                    `<button class="add-task-button" data-project-id="${projectId}">+ 추가</button>` 
                    : ''}
            </div>
            <div class="task-input-form" id="task-form-${projectId}">
                <input type="text" class="task-input" placeholder="새 태스크 제목">
                <div class="task-input-buttons">
                    <button class="task-input-button save-task">저장</button>
                    <button class="task-input-button cancel-task">취소</button>
                </div>
            </div>
            <div class="task-list-content">
                ${generateTaskCards(project.tasks[status])}
            </div>
        </div>
    `;
}

function generateTaskCards(tasks) {
    if (!tasks || tasks.length === 0) {
        return '<div class="task-list-empty">No tasks</div>';
    }
    return tasks.map(task => `
        <div class="task-card" draggable="true">
            <div class="task-card-title">${task.title}</div>
        </div>
    `).join('');
}

function initializeTaskEvents() {
    return `
        // 드래그 앤 드롭 이벤트
        let draggedTask = null;

        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                draggedTask = card;
                const projectContent = card.closest('.project-content');
                const taskTitle = card.querySelector('.task-card-title').textContent;
                draggedTask.dataset.sourceProjectId = projectContent.dataset.projectId;
                draggedTask.dataset.taskTitle = taskTitle;
                e.dataTransfer.setData('text/plain', '');
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                if (draggedTask) {
                    draggedTask.classList.remove('dragging');
                }
                draggedTask = null;
            });
        });

        document.querySelectorAll('.task-list').forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                const projectContent = list.closest('.project-content');
                if (draggedTask && draggedTask.closest('.project-content') === projectContent) {
                    e.dataTransfer.dropEffect = 'move';
                    list.classList.add('drag-over');
                }
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                if (!draggedTask) return;

                const projectContent = list.closest('.project-content');
                if (draggedTask.closest('.project-content') === projectContent) {
                    const taskTitle = draggedTask.dataset.taskTitle;
                    const oldStatus = draggedTask.closest('.task-list').dataset.status;
                    const newStatus = list.dataset.status;
                    const projectId = projectContent.dataset.projectId;

                    vscode.postMessage({
                        command: 'moveTask',
                        taskTitle: taskTitle,
                        oldStatus: oldStatus,
                        newStatus: newStatus,
                        projectId: parseInt(projectId)
                    });
                }
            });
        });

        // 태스크 추가 관련 이벤트
        document.querySelectorAll('.add-task-button').forEach(button => {
            button.addEventListener('click', () => {
                const projectId = button.dataset.projectId;
                const form = document.getElementById('task-form-' + projectId);
                form.classList.add('active');
                form.querySelector('.task-input').focus();
            });
        });

        document.querySelectorAll('.save-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const form = e.target.closest('.task-input-form');
                const input = form.querySelector('.task-input');
                const taskTitle = input.value.trim();
                const projectId = form.id.split('-')[2];
                
                if (taskTitle) {
                    vscode.postMessage({
                        command: 'addTask',
                        projectId: projectId,
                        title: taskTitle
                    });
                    
                    input.value = '';
                    form.classList.remove('active');
                }
            });
        });

        document.querySelectorAll('.cancel-task').forEach(button => {
            button.addEventListener('click', (e) => {
                const form = e.target.closest('.task-input-form');
                form.querySelector('.task-input').value = '';
                form.classList.remove('active');
            });
        });

        document.querySelectorAll('.task-input').forEach(input => {
            input.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    e.target.closest('.task-input-form').querySelector('.save-task').click();
                } else if (e.key === 'Escape') {
                    e.target.closest('.task-input-form').querySelector('.cancel-task').click();
                }
            });
        });
    `;
}

module.exports = {
    generateTaskBoard,
    generateTaskList,
    generateTaskCards,
    initializeTaskEvents
}; 