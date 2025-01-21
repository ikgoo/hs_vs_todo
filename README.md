# HS Preview - VS Code Task Management Extension

A Visual Studio Code extension for managing hierarchical tasks using a Kanban-style board interface. This extension provides a visual way to manage projects and tasks in `.hs` files.

## Features

### Project Management
- Create and manage multiple projects
- Edit project names
- Delete projects with confirmation
- Real-time project list updates

### Task Management
- Kanban board with 4 status columns:
  - Planned
  - Waiting
  - In Progress
  - Completed
- Drag and drop tasks between columns
- Add new tasks with properties
- Edit existing tasks
- Delete tasks with confirmation
- Real-time task updates

### File Format
```
# Project ProjectName
[planned]
- Task1
  * startDate: 2024-03-15
  * endDate: 2024-03-20
  * assignee: John Doe

[waiting]
- Task2
  * waitingReason: Dependency

[inProgress]
- Task3
  * progress: 50%

[completed]
- Task4
  * completionDate: 2024-03-10
```

## Installation

1. Install the extension from VS Code marketplace
2. Open a `.hs` file
3. Use command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
4. Run `HS: Open Preview`

## Usage

### Project Operations
- Click '+' button to add new project
- Click project name to select
- Use edit/delete buttons in project list

### Task Operations
- Click '+' in Planned column to add new task
- Drag tasks between status columns
- Click task to edit properties
- Use delete button to remove tasks

## Development

### Prerequisites
- Node.js
- npm
- Visual Studio Code

### Setup
```bash
git clone https://github.com/ikgoo/hs_vs_todo.git
cd hs_vs_todo
npm install
```

### Build
```bash
npm run build
```

### Debug
1. Open in VS Code
2. Press F5 to start debugging
3. Open a `.hs` file in new window

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Author

[ikgoo](https://github.com/ikgoo)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
