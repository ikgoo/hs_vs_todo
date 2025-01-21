const { STATUS_TYPES, VALID_DETAILS } = require('./hs_data');

class HsParser {
    constructor() {
        this.STATUS_TYPES = STATUS_TYPES;
        this.VALID_DETAILS = VALID_DETAILS;
    }

    parse(content) {
        try {
            const lines = content.split('\n');
            const projects = [];
            let currentProject = null;
            let currentStatus = null;
            let currentTask = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                if (trimmedLine === '') continue;

                if (trimmedLine.startsWith('# Project')) {
                    if (currentProject) {
                        projects.push(currentProject);
                    }
                    const projectName = trimmedLine.replace(/^# Project:?\s*/, '').trim();
                    currentProject = {
                        name: projectName,
                        tasks: this.STATUS_TYPES.reduce((acc, status) => {
                            acc[status] = [];
                            return acc;
                        }, {})
                    };
                } else if (trimmedLine.match(/^\[(planned|waiting|inProgress|completed)\]$/)) {
                    currentStatus = trimmedLine.match(/^\[(.*)\]$/)[1];
                    currentTask = null;
                } else if (trimmedLine.startsWith('- ') && currentProject && currentStatus) {
                    currentTask = {
                        title: trimmedLine.substring(2).trim(),
                        status: currentStatus,
                        details: {}
                    };
                    currentProject.tasks[currentStatus].push(currentTask);
                } else if (line.match(/^\s*\*\s+\w+:\s+.+$/) && currentTask) {
                    // 들여쓰기와 함께 세부 정보 파싱
                    const detailMatch = line.match(/^\s*\*\s+(\w+):\s+(.+)$/);
                    if (detailMatch) {
                        const [, key, value] = detailMatch;
                        if (this.VALID_DETAILS[key] && this.VALID_DETAILS[key].test(value.trim())) {
                            currentTask.details[key] = value.trim();
                        } else if (!this.VALID_DETAILS[key]) {
                            console.warn(`Warning: Unknown detail key "${key}" at line ${i + 1}`);
                        } else {
                            console.warn(`Warning: Invalid value format for "${key}" at line ${i + 1}`);
                        }
                    }
                } else if (!trimmedLine.match(/^\s*$/)) {
                    throw new Error(`Invalid syntax at line ${i + 1}: ${line}`);
                }
            }

            if (currentProject) {
                projects.push(currentProject);
            }

            return {
                success: true,
                data: projects
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    stringify(projects) {
        try {
            let content = '';
            
            projects.forEach(project => {
                // 프로젝트 헤더 (콜론 없이)
                content += `# Project ${project.name}\n`;

                // 각 상태별 태스크
                this.STATUS_TYPES.forEach(status => {
                    content += `[${status}]\n`;
                    const tasks = project.tasks[status] || [];
                    tasks.forEach(task => {
                        content += `- ${task.title}\n`;
                        if (task.details) {
                            Object.entries(task.details).forEach(([key, value]) => {
                                content += `  * ${key}: ${value}\n`;
                            });
                        }
                    });
                    content += '\n';
                });
                content += '\n';
            });

            return {
                success: true,
                data: content
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    validate(projects) {
        try {
            if (!Array.isArray(projects)) {
                throw new Error('Projects must be an array');
            }

            projects.forEach((project, index) => {
                if (!project.name) {
                    throw new Error(`Project at index ${index} must have a name`);
                }

                if (!project.tasks) {
                    throw new Error(`Project "${project.name}" must have tasks`);
                }

                this.STATUS_TYPES.forEach(status => {
                    if (!Array.isArray(project.tasks[status])) {
                        throw new Error(`Project "${project.name}" must have ${status} tasks array`);
                    }
                });
            });

            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = HsParser; 