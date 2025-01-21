const { STATUS_TYPES, STATUS_LABELS } = require('./hs_data');

function generateProjectButtons(projects) {
    return `
        <div class="project-section">
            <div class="project-header">
                <div class="project-buttons">
                    ${projects.map((project, index) => `
                        <button class="project-button ${index === 0 ? 'active' : ''}" 
                                data-project-id="${index}">
                            ${project.name}
                        </button>
                    `).join('')}
                </div>
                <button class="add-project-button">+ 새 프로젝트</button>
            </div>
            <div class="project-input-form">
                <input type="text" class="project-input" placeholder="새 프로젝트 이름">
                <div class="project-input-buttons">
                    <button class="project-input-button save-project">저장</button>
                    <button class="project-input-button cancel-project">취소</button>
                </div>
            </div>
        </div>
    `;
}

function initializeProjectEvents() {
    return `
        // 프로젝트 선택 기능
        document.querySelectorAll('.project-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.project-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                document.querySelectorAll('.project-content').forEach(content => 
                    content.classList.remove('active')
                );

                const projectId = button.dataset.projectId;
                button.classList.add('active');
                document.getElementById('project-' + projectId).classList.add('active');
            });
        });

        // 프로젝트 추가 관련 이벤트
        const addProjectButton = document.querySelector('.add-project-button');
        const projectInputForm = document.querySelector('.project-input-form');
        const projectInput = document.querySelector('.project-input');

        addProjectButton.addEventListener('click', () => {
            projectInputForm.classList.add('active');
            projectInput.focus();
        });

        document.querySelector('.save-project').addEventListener('click', () => {
            const projectName = projectInput.value.trim();
            if (projectName) {
                vscode.postMessage({
                    command: 'addProject',
                    name: projectName
                });
                projectInput.value = '';
                projectInputForm.classList.remove('active');
            }
        });

        document.querySelector('.cancel-project').addEventListener('click', () => {
            projectInput.value = '';
            projectInputForm.classList.remove('active');
        });

        projectInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                document.querySelector('.save-project').click();
            } else if (e.key === 'Escape') {
                document.querySelector('.cancel-project').click();
            }
        });
    `;
}

module.exports = {
    generateProjectButtons,
    initializeProjectEvents
}; 