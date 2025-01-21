// 상태 타입 정의
const STATUS_TYPES = ['planned', 'waiting', 'inProgress', 'completed'];

// 상태 레이블 정의
const STATUS_LABELS = {
    planned: 'Planned',
    waiting: 'Waiting',
    inProgress: 'In Progress',
    completed: 'Completed'
};

// 유효한 세부 정보 필드와 형식 정의
const VALID_DETAILS = {
    plannedStartDate: /^\d{4}-\d{2}-\d{2}$/,
    plannedEndDate: /^\d{4}-\d{2}-\d{2}$/,
    startDate: /^\d{4}-\d{2}-\d{2}$/,
    endDate: /^\d{4}-\d{2}-\d{2}$/,
    assignee: /.+/,
    priority: /^(high|medium|low)$/,
    progress: /^\d{1,3}%$/,
    waitingReason: /.+/,
    previousStatus: /.+/,
    duration: /.+/,
    note: /.+/
};

module.exports = {
    STATUS_TYPES,
    STATUS_LABELS,
    VALID_DETAILS
}; 