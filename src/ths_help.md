# THS (Task History System) 파일 형식 가이드

## 개요
THS는 프로젝트의 태스크를 관리하고 이력을 추적하기 위한 파일 형식입니다.

## 파일 구조

### 프로젝트 정의
```
# Project: 프로젝트1
[planned]
- Task1: 기획서 작성
  * plannedStartDate: 2024-03-25
  * plannedEndDate: 2024-03-30
  * assignee: 김철수
  * priority: high

[inProgress]
- Task2: API 개발
  * startDate: 2024-03-15
  * plannedEndDate: 2024-03-25
  * assignee: 이영희
  * progress: 60%
  * statusHistory:
    - planned (2024-03-10 ~ 2024-03-14)
    - waiting (2024-03-14 ~ 2024-03-15)
    - inProgress (2024-03-15 ~ current)
```

### 태스크 상태 구분
- [planned] - 예정된 태스크
- [waiting] - 대기 중인 태스크
- [inProgress] - 진행 중인 태스크
- [completed] - 완료된 태스크

### 태스크 정보
각 태스크는 다음과 같은 정보를 포함할 수 있습니다:

#### 필수 필드
- title: 태스크 제목

#### 날짜 관련 필드
- plannedStartDate: 예정 시작일 (YYYY-MM-DD)
- plannedEndDate: 예정 완료일 (YYYY-MM-DD)
- startDate: 실제 시작일 (YYYY-MM-DD)
- endDate: 실제 완료일 (YYYY-MM-DD)

#### 상태 관련 필드
- status: 현재 상태 (planned/waiting/inProgress/completed)
- previousStatus: 이전 상태
- statusHistory: 상태 변경 이력
  - status: 상태
  - startDate: 해당 상태 시작일
  - endDate: 해당 상태 종료일 (현재 진행 중인 경우 'current')

#### 기타 필드
- assignee: 담당자
- priority: 우선순위 (high/medium/low)
- progress: 진행률 (0-100%)
- waitingReason: 대기 사유
- duration: 소요 시간
- note: 참고 사항

### 태스크 순서 관리
- 각 상태(planned/waiting/inProgress/completed) 내에서 태스크의 순서는 위에서 아래로 우선순위를 나타냅니다
- 태스크는 드래그 앤 드롭으로 순서를 변경할 수 있습니다:
  1. 같은 상태 내에서 순서 변경
  2. 다른 상태로 이동
- 순서가 변경되면 파일에도 반영됩니다

## 사용 예시

## 문법 규칙
1. 프로젝트는 '# Project:' 로 시작
2. 상태는 대괄호([])로 구분
3. 태스크는 하이픈(-)으로 시작
4. 태스크의 세부 정보는 별표(*)로 시작하고 들여쓰기
5. 날짜는 YYYY-MM-DD 형식 사용
6. 상태 이력은 하이픈(-)으로 구분하고 추가 들여쓰기
7. 태스크의 순서는 중요도나 우선순위를 나타냅니다 (위에 있을수록 우선순위가 높음)

## 주의사항
- 모든 날짜는 YYYY-MM-DD 형식을 준수해야 함
- 진행률은 숫자와 % 기호로 표시 (예: 60%)
- 우선순위는 high, medium, low 중 하나를 사용
- 상태는 planned, waiting, inProgress, completed 중 하나를 사용