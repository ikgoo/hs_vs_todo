const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const HsParser = require('./HsParser');
const { STATUS_TYPES, STATUS_LABELS } = require('./hs_data');
const parser = new HsParser();
const { generateProjectButtons, initializeProjectEvents } = require('./hs_project');
const { generateTaskBoard, initializeTaskEvents } = require('./hs_task');

// webview 패널을 전역 변수로 저장
let currentPanel = null;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('확장 프로그램이 활성화되었습니다.');

    // HS 파일 열기 이벤트 감지
    let disposable = vscode.workspace.onDidOpenTextDocument((document) => {
        try {
            if (document.fileName.endsWith('.hs')) {
                vscode.window.showInformationMessage('HS 파일이 열렸습니다: ' + document.fileName);
            }
        } catch (error) {
            console.error('파일 확인 중 오류 발생:', error);
        }
    });

    // Preview 명령어 등록
    let previewCommand = vscode.commands.registerCommand('your-extension.openHsPreview', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.document.fileName.endsWith('.hs')) {
            if (currentPanel) {
                currentPanel.reveal(vscode.ViewColumn.Beside);
            } else {
                currentPanel = vscode.window.createWebviewPanel(
                    'hsPreview',
                    'HS Preview',
                    vscode.ViewColumn.Beside,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );

                // 패널이 닫힐 때
                currentPanel.onDidDispose(() => {
                    currentPanel = null;
                });
            }

            updatePreviewContent(currentPanel, activeEditor.document);
            
            // dist/webview.js 파일 변경 감지
            const webviewPath = path.join(__dirname, '..', 'dist', 'webview.js');
            fs.watch(webviewPath, (eventType) => {
                if (eventType === 'change' && currentPanel) {
                    updatePreviewContent(currentPanel, activeEditor.document);
                }
            });

            // 파일 내용이 변경될 때 미리보기 업데이트
            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document === activeEditor.document) {
                    updatePreviewContent(currentPanel, e.document);
                }
            });

            // 패널이 닫힐 때 이벤트 구독 해제
            currentPanel.onDidDispose(() => {
                changeDocumentSubscription.dispose();
            });

            // 웹뷰에서 메시지 수신
            currentPanel.webview.onDidReceiveMessage(
                async message => {
                    switch (message.command) {
                        case 'addTask':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                const projectId = parseInt(message.projectId);
                                const project = projects[projectId];

                                if (!project) {
                                    vscode.window.showErrorMessage(`프로젝트를 찾을 수 없습니다: ${projectId}`);
                                    return;
                                }

                                // 새 태스크 생성
                                const newTask = {
                                    title: message.title,
                                    status: 'planned',
                                    details: {}
                                };

                                // properties에서 빈 값이 아닌 속성만 details에 추가
                                if (message.properties) {
                                    Object.entries(message.properties).forEach(([key, value]) => {
                                        if (value && value.trim() !== '') {
                                            newTask.details[key] = value.trim();
                                        }
                                    });
                                }

                                // 태스크 추가
                                project.tasks.planned.push(newTask);

                                // 변경된 내용을 문자열로 변환
                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                // 파일 내용 업데이트
                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                                vscode.window.showInformationMessage(
                                    `프로젝트 ${project.name}에 새 태스크가 추가되었습니다: ${message.title}`
                                );
                            } catch (error) {
                                vscode.window.showErrorMessage('태스크 추가 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'moveTask':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                const projectId = message.projectId;
                                const taskTitle = message.taskTitle;
                                const oldStatus = message.oldStatus;
                                const newStatus = message.newStatus;
                                const newIndex = message.newIndex;  // 새로운 위치 정보

                                // 프로젝트 찾기
                                const project = projects[projectId];
                                if (!project) {
                                    vscode.window.showErrorMessage(`프로젝트를 찾을 수 없습니다: ${projectId}`);
                                    return;
                                }

                                // 이동할 태스크 찾기
                                const taskIndex = project.tasks[oldStatus].findIndex(task => task.title === taskTitle);
                                if (taskIndex === -1) {
                                    vscode.window.showErrorMessage(`태스크를 찾을 수 없습니다: ${taskTitle}`);
                                    return;
                                }

                                // 태스크 이동
                                const task = project.tasks[oldStatus].splice(taskIndex, 1)[0];
                                task.status = newStatus;  // 상태 업데이트
                                
                                // 지정된 위치에 태스크 삽입
                                project.tasks[newStatus].splice(newIndex, 0, task);

                                // 변경된 내용을 문자열로 변환
                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                // 파일 내용 업데이트
                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                                vscode.window.showInformationMessage(
                                    `프로젝트 ${project.name}의 태스크가 ${oldStatus}에서 ${newStatus}로 이동되었습니다.`
                                );
                            } catch (error) {
                                vscode.window.showErrorMessage('작업 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'addProject':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                
                                // 새 프로젝트 추가
                                projects.push({
                                    name: message.name,
                                    tasks: STATUS_TYPES.reduce((acc, status) => {
                                        acc[status] = [];
                                        return acc;
                                    }, {})
                                });

                                // 변경된 내용을 문자열로 변환
                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                // 파일 내용 업데이트
                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                                vscode.window.showInformationMessage(`새 프로젝트가 추가되었습니다: ${message.name}`);
                            } catch (error) {
                                vscode.window.showErrorMessage('프로젝트 추가 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'editProject':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                const oldName = projects[message.projectId].name;
                                projects[message.projectId].name = message.newName;

                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                                // 전체 데이터 다시 전송
                                const updatedContent = document.getText();
                                const updatedParseResult = parser.parse(updatedContent);
                                if (updatedParseResult.success) {
                                    currentPanel.webview.postMessage({
                                        command: 'updateContent',
                                        data: updatedParseResult.data
                                    });
                                }

                                vscode.window.showInformationMessage(
                                    `프로젝트 이름이 변경되었습니다: ${oldName} → ${message.newName}`
                                );
                            } catch (error) {
                                vscode.window.showErrorMessage('프로젝트 수정 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'deleteProject':
                            try {
                                const choice = await vscode.window.showWarningMessage(
                                    `정말로 '${message.projectName}' 프로젝트를 삭제하시겠습니까?`,
                                    { modal: true },
                                    '삭제'
                                );

                                if (choice === '삭제') {
                                    const document = activeEditor.document;
                                    const content = document.getText();
                                    const parseResult = parser.parse(content);
                                    
                                    if (!parseResult.success) {
                                        vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                        return;
                                    }

                                    const projects = parseResult.data;
                                    const projectName = projects[message.projectId].name;
                                    projects.splice(message.projectId, 1);

                                    const stringifyResult = parser.stringify(projects);
                                    if (!stringifyResult.success) {
                                        vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                        return;
                                    }

                                    const edit = new vscode.WorkspaceEdit();
                                    edit.replace(
                                        document.uri,
                                        new vscode.Range(
                                            new vscode.Position(0, 0),
                                            new vscode.Position(document.lineCount, 0)
                                        ),
                                        stringifyResult.data
                                    );

                                    await vscode.workspace.applyEdit(edit);
                                    await document.save();

                                    currentPanel.webview.postMessage({
                                        command: 'deleteProject',
                                        projectId: message.projectId
                                    });

                                    vscode.window.showInformationMessage(`프로젝트가 삭제되었습니다: ${projectName}`);
                                }
                            } catch (error) {
                                vscode.window.showErrorMessage('프로젝트 삭제 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'deleteTask':
                            try {
                                const choice = await vscode.window.showWarningMessage(
                                    `정말로 '${message.taskTitle}' 태스크를 삭제하시겠습니까?`,
                                    { modal: true },
                                    '삭제'
                                );

                                if (choice === '삭제') {
                                    const document = activeEditor.document;
                                    const content = document.getText();
                                    const parseResult = parser.parse(content);
                                    
                                    if (!parseResult.success) {
                                        vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                        return;
                                    }

                                    const projects = parseResult.data;
                                    const project = projects[message.projectId];
                                    
                                    // message의 taskIndex를 사용하여 태스크 삭제
                                    project.tasks[message.status].splice(message.taskIndex, 1);

                                    const stringifyResult = parser.stringify(projects);
                                    if (!stringifyResult.success) {
                                        vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                        return;
                                    }

                                    const edit = new vscode.WorkspaceEdit();
                                    edit.replace(
                                        document.uri,
                                        new vscode.Range(
                                            new vscode.Position(0, 0),
                                            new vscode.Position(document.lineCount, 0)
                                        ),
                                        stringifyResult.data
                                    );

                                    await vscode.workspace.applyEdit(edit);
                                    await document.save();

                                    // 전체 데이터 다시 전송
                                    const updatedContent = document.getText();
                                    const updatedParseResult = parser.parse(updatedContent);
                                    if (updatedParseResult.success) {
                                        currentPanel.webview.postMessage({
                                            command: 'updateContent',
                                            data: updatedParseResult.data
                                        });
                                    }

                                    vscode.window.showInformationMessage(`태스크가 삭제되었습니다: ${message.taskTitle}`);
                                }
                            } catch (error) {
                                vscode.window.showErrorMessage('태스크 삭제 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'reorderTask':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                const project = projects[message.projectId];
                                const status = message.status;
                                const tasks = project.tasks[status];
                                
                                // 태스크 순서 변경
                                const [movedTask] = tasks.splice(message.oldIndex, 1);
                                tasks.splice(message.newIndex, 0, movedTask);

                                // 변경된 내용을 문자열로 변환
                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                // 파일 내용 업데이트
                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                            } catch (error) {
                                vscode.window.showErrorMessage('태스크 순서 변경 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                        case 'editTask':
                            if (message.type === 'edit') {
                                try {
                                    const document = activeEditor.document;
                                    const content = document.getText();
                                    const parseResult = parser.parse(content);
                                    
                                    if (!parseResult.success) {
                                        vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                        return;
                                    }

                                    const projects = parseResult.data;
                                    const project = projects[message.projectId];
                                    const task = project.tasks[message.status][message.taskIndex];

                                    // webview에 수정 폼 표시 요청
                                    currentPanel.webview.postMessage({
                                        command: 'showEditTaskForm',
                                        task: task,
                                        status: message.status,
                                        taskIndex: message.taskIndex
                                    });
                                } catch (error) {
                                    vscode.window.showErrorMessage('태스크 수정 중 오류가 발생했습니다: ' + error.message);
                                }
                            }
                            return;
                        case 'updateTask':
                            try {
                                const document = activeEditor.document;
                                const content = document.getText();
                                const parseResult = parser.parse(content);
                                
                                if (!parseResult.success) {
                                    vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
                                    return;
                                }

                                const projects = parseResult.data;
                                const project = projects[message.projectId];
                                project.tasks[message.status][message.taskIndex] = message.updatedTask;

                                const stringifyResult = parser.stringify(projects);
                                if (!stringifyResult.success) {
                                    vscode.window.showErrorMessage(`저장 오류: ${stringifyResult.error}`);
                                    return;
                                }

                                const edit = new vscode.WorkspaceEdit();
                                edit.replace(
                                    document.uri,
                                    new vscode.Range(
                                        new vscode.Position(0, 0),
                                        new vscode.Position(document.lineCount, 0)
                                    ),
                                    stringifyResult.data
                                );

                                await vscode.workspace.applyEdit(edit);
                                await document.save();

                                vscode.window.showInformationMessage(`태스크가 수정되었습니다: ${message.updatedTask.title}`);
                            } catch (error) {
                                vscode.window.showErrorMessage('태스크 수정 중 오류가 발생했습니다: ' + error.message);
                            }
                            return;
                    }
                },
                undefined,
                context.subscriptions
            );
        }
    });

    context.subscriptions.push(disposable, previewCommand);
}

function updatePreviewContent(panel, document) {
    const content = document.getText();
    const parseResult = parser.parse(content);
    
    if (!parseResult.success) {
        vscode.window.showErrorMessage(`파싱 오류: ${parseResult.error}`);
        return;
    }

    const validateResult = parser.validate(parseResult.data);
    if (!validateResult.success) {
        vscode.window.showErrorMessage(`유효성 검사 오류: ${validateResult.error}`);
        return;
    }

    // 패널이 처음 생성될 때만 전체 HTML을 설정
    if (!panel.webview.html) {
        panel.webview.html = getWebviewContent(parseResult.data);
    } else {
        // 이후 변경사항은 메시지를 통해 전달
        panel.webview.postMessage({
            command: 'updateContent',
            data: parseResult.data
        });
    }
}

function parseHsContent(content) {
    const STATUS_TYPES = ['planned', 'waiting', 'inProgress', 'completed'];
    const projects = [];
    let currentProject = null;
    let currentStatus = null;

    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('# Project:')) {
            if (currentProject) {
                projects.push(currentProject);
            }
            // 새 프로젝트를 생성할 때 모든 상태 컬럼을 초기화
            currentProject = {
                name: line.substring(10).trim(),
                tasks: STATUS_TYPES.reduce((acc, status) => {
                    acc[status] = [];
                    return acc;
                }, {})
            };
        } else if (line.match(/^\[(planned|waiting|inProgress|completed)\]$/)) {
            currentStatus = line.match(/^\[(.*)\]$/)[1];
        } else if (line.startsWith('- ') && currentProject && currentStatus) {
            const task = {
                title: line.substring(2).trim(),
                details: {}
            };
            currentProject.tasks[currentStatus].push(task);
        }
    }
    if (currentProject) {
        projects.push(currentProject);
    }
    return projects;
}

function getCssContent() {
    const cssPath = path.join(__dirname, 'styles.css');
    try {
        return fs.readFileSync(cssPath, 'utf8');
    } catch (error) {
        console.error('CSS 파일을 읽는 중 오류 발생:', error);
        return ''; // 기본 빈 CSS 반환
    }
}

function getWebviewContent(projects) {
    const webviewPath = path.join(__dirname, '..', 'dist', 'webview.js');
    const webviewScript = fs.readFileSync(webviewPath, 'utf8');
    const cssPath = path.join(__dirname, 'webview', 'styles', 'index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${cssContent}</style>
        </head>
        <body>
            <div id="root"></div>
            <script>
                window.initialData = ${JSON.stringify(projects)};
            </script>
            <script>${webviewScript}</script>
        </body>
        </html>
    `;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
} 