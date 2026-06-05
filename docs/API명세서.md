# 학과 가상 실습실 예약 및 제어 센터 - API 명세서

## 목차
1. [인증 API](#1-인증-api)
2. [사용자 API](#2-사용자-api)
3. [실습 자원 API](#3-실습-자원-api)
4. [예약 API](#4-예약-api)
5. [공지사항 API](#5-공지사항-api)
6. [이슈 관리 API](#6-이슈-관리-api)
7. [컨테이너 API](#7-컨테이너-api)
8. [공통 정보](#8-공통-정보)

---

## 1. 인증 API

Base URL: `/api/auth`

| 기능 | 메서드 | 엔드포인트 | 인증 | 설명 |
|------|--------|-----------|------|------|
| 회원가입 | POST | `/api/auth/register` | 불필요 | 이름, 학번, 이메일, 비밀번호로 가입 |
| 로그인 | POST | `/api/auth/login` | 불필요 | 학번과 비밀번호로 로그인 (access + refresh 토큰 발급) |
| 토큰 재발급 | POST | `/api/auth/refresh` | 불필요 | refresh_token으로 access_token 재발급 |
| 로그아웃 | POST | `/api/auth/logout` | 불필요 | refresh_token을 null로 초기화 |

### 회원가입 `POST /api/auth/register`

**Request Body**
```json
{
  "name": "김학생",
  "student_id": "20240001",
  "email": "student@university.ac.kr",
  "password": "password123"
}
```

**Response** `201 Created`
```json
{
  "message": "회원가입 완료"
}
```

---

### 로그인 `POST /api/auth/login`

**Request Body**
```json
{
  "student_id": "20240001",
  "password": "password123"
}
```

**Response** `200 OK`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

## 2. 사용자 API

Base URL: `/api/users`  
🔑 모든 요청에 Bearer Token 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 내 정보 조회 | GET | `/api/users/me` | 학생/관리자 | 예약 제한 및 현재 예약 횟수 확인 |
| 내 정보 수정 | PATCH | `/api/users/me` | 학생/관리자 | 이름, 이메일, 비밀번호 수정 |
| 회원 탈퇴 | DELETE | `/api/users/me` | 학생/관리자 | is_active: false 처리 (소프트 딜리트) |
| 전체 사용자 목록 | GET | `/api/users` | 관리자 | 전체 학생 목록 조회 |
| 사용자 상태 변경 | PATCH | `/api/users/:id` | 관리자 | 이용정지(false) / 복구(true) 처리 |

### 전체 사용자 목록 `GET /api/users`

**Response** `200 OK`
```json
[
  {
    "_id": "663f...",
    "name": "김학생",
    "student_id": "20240001",
    "email": "student@university.ac.kr",
    "role": "student",
    "is_active": true,
    "current_reservations": 1,
    "max_reservations": 3,
    "createdAt": "2026-05-01T00:00:00Z"
  }
]
```

---

### 사용자 상태 변경 `PATCH /api/users/:id`

**Request Body**
```json
{
  "is_active": false
}
```

**Response** `200 OK`
```json
{
  "message": "김학생 계정이 이용정지 처리되었습니다.",
  "user": { ... }
}
```

---

## 3. 실습 자원 API

Base URL: `/api/resources`  
🔑 관리자 전용 API는 Bearer Token + admin 권한 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 자원 목록 조회 | GET | `/api/resources` | 학생/관리자 | 모든 실습실/서버 리스트 조회 (retired 제외) |
| 특정 자원 상세 | GET | `/api/resources/:id` | 학생/관리자 | 특정 장비 상세 정보 및 운영 시간 확인 |
| 자원 등록 | POST | `/api/resources` | 관리자 | created_by 자동 기록 |
| 자원 수정 | PATCH | `/api/resources/:id` | 관리자 | spec/status/운영 시간 수정 |
| 자원 상태 변경 | PATCH | `/api/resources/:id/status` | 관리자 | active ↔ maintenance 전환 / retired 처리 |

---

## 4. 예약 API

Base URL: `/api/reservations`  
🔑 모든 요청에 Bearer Token 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 예약 신청 | POST | `/api/reservations` | 학생/관리자 | resource_id, start_time, end_time, purpose 전송 |
| 내 예약 목록 | GET | `/api/reservations/me` | 학생/관리자 | 내가 신청한 예약 현황 확인 (만료된 예약 자동 completed 처리) |
| 특정 예약 상세 | GET | `/api/reservations/:id` | 학생/관리자 | 예약 상세 정보 조회 |
| 예약 취소 | PATCH | `/api/reservations/:id/cancel` | 학생/관리자 | status: `cancelled`로 변경 |
| 실제 사용 시작 | PATCH | `/api/reservations/:id/start` | 학생/관리자 | actual_start_time 기록, status: `using`으로 변경 |
| 실제 사용 종료 | PATCH | `/api/reservations/:id/end` | 학생/관리자 | actual_end_time 기록, status: `completed`로 변경 |
| 전체 예약 현황 | GET | `/api/reservations` | 관리자 | 모든 사용자의 예약 리스트 조회 (날짜 필터 가능) |
| 예약 승인 | PATCH | `/api/reservations/:id/approve` | 관리자 | status: `reserved` + approved_by 자동 기록 |
| 예약 거절 | PATCH | `/api/reservations/:id/reject` | 관리자 | status: `cancelled` + cancel_reason 저장 |

### 예약 신청 `POST /api/reservations`

**Request Body**
```json
{
  "resource_id": "663f...",
  "start_time": "2026-05-15T14:00:00Z",
  "end_time": "2026-05-15T16:00:00Z",
  "purpose": "딥러닝 모델 학습 실습"
}
```

**Response** `201 Created`
```json
{
  "message": "예약 신청 완료",
  "reservation": {
    "_id": "774g...",
    "user_id": "663f...",
    "resource_id": "663f...",
    "start_time": "2026-05-15T14:00:00Z",
    "end_time": "2026-05-15T16:00:00Z",
    "purpose": "딥러닝 모델 학습 실습",
    "status": "waiting",
    "approved_by": null,
    "cancel_reason": null,
    "actual_start_time": null,
    "actual_end_time": null,
    "createdAt": "2026-05-15T09:00:00Z",
    "updatedAt": "2026-05-15T09:00:00Z"
  }
}
```

---

### 전체 예약 현황 `GET /api/reservations` (날짜 필터)

**Query Parameters**
| 파라미터 | 필수 | 설명 |
|----------|------|------|
| start_date | 선택 | 조회 시작 날짜 (예: `2026-05-26`) |
| end_date | 선택 | 조회 종료 날짜 (예: `2026-06-01`) |

**예시**
```
GET /api/reservations?start_date=2026-05-26&end_date=2026-06-01
```

---

## 5. 공지사항 API

Base URL: `/api/notices`  
🔑 모든 요청에 Bearer Token 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 공지사항 목록 조회 | GET | `/api/notices` | 학생/관리자 | 전체 공지사항 목록 (최신순) |
| 공지사항 상세 조회 | GET | `/api/notices/:id` | 학생/관리자 | 특정 공지사항 상세 내용 |
| 공지사항 등록 | POST | `/api/notices` | 관리자 | 제목, 내용, 긴급 여부 등록 |
| 공지사항 수정 | PATCH | `/api/notices/:id` | 관리자 | 제목, 내용, 긴급 여부 수정 |
| 공지사항 삭제 | DELETE | `/api/notices/:id` | 관리자 | 공지사항 완전 삭제 |

### 공지사항 등록 `POST /api/notices`

**Request Body**
```json
{
  "title": "서버 점검 안내",
  "content": "5월 20일 오전 2시~4시 서버 점검이 예정되어 있습니다.",
  "is_urgent": true
}
```

**Response** `201 Created`
```json
{
  "message": "공지사항이 등록되었습니다.",
  "notice": {
    "_id": "663f...",
    "title": "서버 점검 안내",
    "content": "5월 20일 오전 2시~4시 서버 점검이 예정되어 있습니다.",
    "is_urgent": true,
    "created_by": { "name": "관리자" },
    "createdAt": "2026-05-15T09:00:00Z"
  }
}
```

---

## 6. 이슈 관리 API

Base URL: `/api/issues`  
🔑 모든 요청에 Bearer Token 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 이슈 등록 | POST | `/api/issues` | 학생/관리자 | 제목, 내용으로 이슈 등록 |
| 내 이슈 목록 | GET | `/api/issues/me` | 학생/관리자 | 내가 등록한 이슈 목록 조회 |
| 전체 이슈 목록 | GET | `/api/issues` | 관리자 | 전체 이슈 목록 조회 |
| 이슈 상태 변경 | PATCH | `/api/issues/:id/status` | 관리자 | waiting → in_progress → resolved |
| 이슈 삭제 | DELETE | `/api/issues/:id` | 관리자 | 이슈 완전 삭제 |

### 이슈 등록 `POST /api/issues`

**Request Body**
```json
{
  "title": "GPU Server A 접속 불가",
  "content": "오후 2시부터 GPU Server A에 SSH 접속이 안 됩니다."
}
```

**Response** `201 Created`
```json
{
  "message": "이슈가 등록되었습니다.",
  "issue": {
    "_id": "663f...",
    "title": "GPU Server A 접속 불가",
    "content": "오후 2시부터 GPU Server A에 SSH 접속이 안 됩니다.",
    "status": "waiting",
    "created_by": "663f...",
    "resolved_by": null,
    "createdAt": "2026-05-15T14:00:00Z"
  }
}
```

---

### 이슈 상태 변경 `PATCH /api/issues/:id/status`

**Request Body**
```json
{
  "status": "in_progress"
}
```

**Response** `200 OK`
```json
{
  "message": "이슈 상태가 변경되었습니다.",
  "issue": { ... }
}
```

> 상태값: `waiting` → `in_progress` → `resolved`

---

## 7. 컨테이너 API

Base URL: `/api/containers`  
🔑 모든 요청에 Bearer Token 필요

| 기능 | 메서드 | 엔드포인트 | 권한 | 설명 |
|------|--------|-----------|------|------|
| 프리셋 목록 조회 | GET | `/api/containers/presets` | 학생/관리자 | 사용 가능한 컨테이너 프리셋 목록 |
| 컨테이너 목록 조회 | GET | `/api/containers` | 학생/관리자 | 현재 실행 중인 컨테이너 목록 |
| 컨테이너 시작 | POST | `/api/containers/run/:presetName` | 관리자 | 프리셋 기반으로 새 컨테이너 생성 및 시작 |
| 컨테이너 종료 | POST | `/api/containers/kill/:dockerContainerId` | 관리자 | 컨테이너 stop + remove |

---

## 8. 공통 정보

### 예약 Status 값

| status 값 | 의미 | 전환 조건 |
|-----------|------|----------|
| `waiting` | 승인 대기 중 | 예약 신청 직후 기본값 |
| `reserved` | 예약됨 | 관리자가 승인했을 때 |
| `using` | 사용 중 | 실제 사용 시작했을 때 |
| `cancelled` | 취소됨 | 사용자가 직접 취소하거나 관리자가 거절했을 때 |
| `completed` | 완료 | 사용 종료 후 반납됐을 때 |

> ⚠️ `cancelled` 상태일 때 `cancel_reason` 필드에 취소/거절 사유가 저장됩니다.

### 이슈 Status 값

| status 값 | 의미 |
|-----------|------|
| `waiting` | 접수 대기 중 |
| `in_progress` | 처리 중 |
| `resolved` | 처리 완료 |

### 인증 방식

모든 인증이 필요한 API는 요청 헤더에 아래와 같이 포함해야 합니다:

```
Authorization: Bearer {accessToken}
```

### 운영 시간 제한

- 예약 가능 시작 시간: `09:00`
- 예약 가능 종료 시간: `22:00`
- 운영 요일: 월~금 (mon, tue, wed, thu, fri)
- 운영 시간 외 예약 시도 시 `400 Bad Request` 반환

### 충돌 방지 알고리즘 동작 흐름

예약 신청 시 아래 순서로 유효성 검사를 진행합니다.

**1단계: 리소스 상태 확인**
- 존재하지 않는 리소스 → `404 Not Found`
- `maintenance` 상태 → `400 Bad Request` ("현재 점검 중인 시설입니다.")
- `retired` 상태 → `400 Bad Request` ("사용 불가능한 시설입니다.")

**2단계: 운영 요일/시간 확인**
- 요청한 날짜가 운영 요일(mon~fri)이 아닌 경우 → `400 Bad Request` ("운영일이 아닙니다.")
- 요청한 시간이 운영 시간(09:00~22:00) 범위를 벗어난 경우 → `400 Bad Request`

**3단계: 중복 예약 확인**
- 동일 자원에 동일 시간대로 이미 `waiting`, `reserved`, `using` 상태의 예약이 있는 경우
- 완전히 동일한 시간(start_time, end_time 모두 일치) → `409 Conflict` ("이미 동일한 예약이 존재합니다.")

**4단계: 최대 동시 예약 수 확인**
- 동일 자원의 해당 시간대 예약 수가 `max_concurrent` 이상인 경우 → `409 Conflict`
- `max_concurrent` 기본값: 1 (설정 안 된 경우)

**✅ 모든 검사 통과 시 예약 생성**