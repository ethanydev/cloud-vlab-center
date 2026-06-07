# 클라우드 기반 학과 가상 실습실 예약 및 제어 센터 — 최종 보고서


---

## 1. 실험의 목적과 범위

### 1-1. 목적

학과에서 운영하는 공용 서버 및 고사양 PC 자원을 학생들이 효율적으로 예약하고 사용할 수 있도록, 웹 기반 예약 및 제어 시스템을 설계·구현한다. 관리자는 자원 상태를 실시간으로 모니터링하고, 컨테이너 기반 실습 환경을 동적으로 생성·종료할 수 있다.

### 1-2. 포함 범위

| 구분 | 내용 |
|------|------|
| 인증 | 이메일 인증 기반 회원가입, JWT 토큰 로그인/갱신/로그아웃 |
| 예약 | 자원 예약 신청, 충돌 방지 알고리즘, 상태 관리(승인/거절/강제 회수) |
| 자원 관리 | 실습 자원 CRUD, 운영 시간 설정, 상태(active/maintenance/retired) 관리 |
| 사용자 관리 | 전체 사용자 조회, 이용정지/복구 |
| 공지사항 | 관리자 등록, 학생 조회, 긴급 공지 |
| 이슈 관리 | 학생 이슈 등록, 관리자 상태 처리(waiting/in_progress/resolved) |
| Docker 제어 | 컨테이너 프리셋 기반 생성/종료 |
| 모니터링 | Grafana/Prometheus 기반 서버 상태 시각화 |

### 1-3. 미포함 범위

- 실시간 알림(웹소켓) 기능은 구현 완료 후 통합 예정
- 모바일 앱은 지원하지 않으며 웹 브라우저 기반으로만 동작

---

## 2. 분석 — 기능 목록 (유스케이스)

### 2-1. 액터 정의

| 액터 | 설명 | 주요 기능 |
|------|------|-----------|
| **학생** | 학과 학생 (일반 사용자) | 회원가입, 로그인, 예약 신청/취소, 공지 조회, 이슈 등록 |
| **관리자** | 시스템 관리자 | 예약 승인/거절, 자원 관리, 사용자 관리, 컨테이너 제어, 공지/이슈 관리 |

---

### 2-2. 유스케이스 목록

| UC-ID | 유스케이스명 | 액터 | 관련 API |
|-------|------------|------|---------|
| UC-01 | 회원가입 | 비로그인 사용자 | `POST /api/auth/register` |
| UC-02 | 로그인 | 학생, 관리자 | `POST /api/auth/login` |
| UC-03 | 예약 신청 | 학생 | `POST /api/reservations`, `GET /api/resources` |
| UC-04 | 내 예약 현황 조회 | 학생 | `GET /api/reservations/me` |
| UC-05 | 예약 취소 | 학생 | `PATCH /api/reservations/:id/cancel` |
| UC-06 | 실제 사용 시작 / 종료 | 학생 | `PATCH /api/reservations/:id/start`, `PATCH /api/reservations/:id/end` |
| UC-07 | 공지사항 조회 | 학생, 관리자 | `GET /api/notices`, `GET /api/notices/:id` |
| UC-08 | 이슈 등록 및 조회 | 학생 | `POST /api/issues`, `GET /api/issues/me` |
| UC-09 | 예약 승인 / 거절 | 관리자 | `PATCH /api/reservations/:id/approve`, `PATCH /api/reservations/:id/reject` |
| UC-10 | 사용자 이용정지 / 복구 | 관리자 | `GET /api/users`, `PATCH /api/users/:id` |
| UC-11 | 자원 관리 | 관리자 | `GET /api/resources`, `POST /api/resources`, `PATCH /api/resources/:id/status` |
| UC-12 | 공지사항 등록 / 수정 / 삭제 | 관리자 | `POST /api/notices`, `PATCH /api/notices/:id`, `DELETE /api/notices/:id` |
| UC-13 | 이슈 상태 변경 및 삭제 | 관리자 | `PATCH /api/issues/:id/status`, `DELETE /api/issues/:id` |
| UC-14 | 컨테이너 생성 및 종료 | 관리자 | `GET /api/containers/presets`, `GET /api/containers`, `POST /api/containers/run/:presetName`, `POST /api/containers/kill/:id` |

---

### 2-3. 유스케이스 상세 명세

#### UC-01: 회원가입

| 항목 | 내용 |
|------|------|
| **액터** | 비로그인 사용자 |
| **개요** | 학생이 이름, 학번, 이메일, 비밀번호를 입력하여 계정을 생성한다. |
| **사전 조건** | 사용자가 로그인되어 있지 않은 상태 |
| **사후 조건** | 새 계정이 DB에 저장되며 로그인 페이지로 이동한다. |
| **기본 흐름** | 1. 회원가입 페이지 접속 → 2. 이름, 학번, 이메일, 비밀번호 입력 → 3. 시스템이 입력값 검증 후 계정 생성 → 4. 로그인 페이지로 이동 |
| **예외 흐름** | 이미 등록된 학번/이메일 → 중복 오류 / 필수 항목 미입력 → 입력 요청 |
| **관련 API** | `POST /api/auth/register` |

#### UC-02: 로그인

| 항목 | 내용 |
|------|------|
| **액터** | 학생, 관리자 |
| **개요** | 학번과 비밀번호를 입력하여 시스템에 로그인한다. |
| **사전 조건** | 사용자가 로그인되어 있지 않은 상태 |
| **사후 조건** | AccessToken과 RefreshToken이 발급되며 대시보드로 이동한다. |
| **기본 흐름** | 1. 로그인 페이지 접속 → 2. 학번, 비밀번호 입력 → 3. 시스템이 자격증명 검증 후 토큰 발급 → 4. 역할에 따라 대시보드로 이동 |
| **예외 흐름** | 학번/비밀번호 불일치 → 오류 메시지 / 비활성화 계정 → 이용정지 안내 |
| **관련 API** | `POST /api/auth/login` |

#### UC-03: 예약 신청

| 항목 | 내용 |
|------|------|
| **액터** | 학생 |
| **개요** | 학생이 사용할 자원과 날짜, 시간, 목적을 선택하여 예약을 신청한다. |
| **사전 조건** | 학생이 로그인된 상태이며 예약 가능 횟수가 남아있는 상태 |
| **사후 조건** | 예약이 `waiting` 상태로 DB에 저장되고 관리자 승인을 대기한다. |
| **기본 흐름** | 1. 예약 신청 페이지 접속 → 2. 자원 선택 → 3. 날짜/시간 선택 → 4. 사용 목적 입력 → 5. 충돌 방지 알고리즘 유효성 검사 → 6. `waiting` 상태로 예약 생성 |
| **예외 흐름** | 운영일(월~금) 외 → 오류 / 운영시간(09:00~22:00) 외 → 오류 / 동일 시간대 초과 → 409 / 예약 횟수 초과 → 오류 |
| **관련 API** | `POST /api/reservations`, `GET /api/resources` |

#### UC-04: 내 예약 현황 조회

| 항목 | 내용 |
|------|------|
| **액터** | 학생 |
| **개요** | 학생이 본인의 예약 목록을 조회하고 상태를 확인한다. |
| **사전 조건** | 학생이 로그인된 상태 |
| **사후 조건** | 예약 목록이 표시되며, 만료된 예약은 자동으로 `completed` 처리된다. |
| **기본 흐름** | 1. 내 예약 현황 페이지 접속 → 2. 만료 예약 자동 completed 처리 → 3. 전체 예약 목록 최신순 표시 |
| **예외 흐름** | 예약 내역 없음 → 빈 목록 안내 |
| **관련 API** | `GET /api/reservations/me` |

#### UC-05: 예약 취소

| 항목 | 내용 |
|------|------|
| **액터** | 학생 |
| **개요** | 학생이 본인의 예약을 취소한다. |
| **사전 조건** | 학생이 로그인된 상태이며 취소 가능한 예약이 존재 |
| **사후 조건** | 예약 상태가 `cancelled`로 변경되고 예약 가능 횟수가 1 복구된다. |
| **기본 흐름** | 1. 내 예약 현황에서 취소할 예약 선택 → 2. 취소 버튼 클릭 → 3. 취소 가능 여부 검증 → 4. 상태 `cancelled`로 변경 |
| **예외 흐름** | 이미 취소/완료된 예약 → 오류 / 본인 예약 아닌 경우 → 403 |
| **관련 API** | `PATCH /api/reservations/:id/cancel` |

#### UC-06: 실제 사용 시작 / 종료

| 항목 | 내용 |
|------|------|
| **액터** | 학생 |
| **개요** | 학생이 승인된 예약의 실제 사용을 시작하고 종료한다. |
| **사전 조건** | 학생이 로그인된 상태이며 `reserved` 상태의 예약이 존재 |
| **사후 조건** | 사용 시작: `using`으로 변경 / 사용 종료: `completed`로 변경 |
| **기본 흐름** | 1. 사용 시작 클릭 → `actual_start_time` 기록, 상태 `using` → 2. 사용 종료 클릭 → `actual_end_time` 기록, 상태 `completed` |
| **예외 흐름** | `reserved` 아닌 예약에 시작 시도 → 오류 / `using` 아닌 예약에 종료 시도 → 오류 |
| **관련 API** | `PATCH /api/reservations/:id/start`, `PATCH /api/reservations/:id/end` |

#### UC-07: 공지사항 조회

| 항목 | 내용 |
|------|------|
| **액터** | 학생, 관리자 |
| **개요** | 사용자가 공지사항 목록 및 상세 내용을 조회한다. |
| **사전 조건** | 사용자가 로그인된 상태 |
| **사후 조건** | 공지사항 목록 또는 상세 내용이 화면에 표시된다. |
| **기본 흐름** | 1. 공지사항 페이지 접속 → 2. 최신순 목록 표시 (긴급 공지 상단 강조) → 3. 클릭 시 상세 내용 확인 |
| **예외 흐름** | 공지사항 없음 → 빈 목록 안내 |
| **관련 API** | `GET /api/notices`, `GET /api/notices/:id` |

#### UC-08: 이슈 등록 및 조회

| 항목 | 내용 |
|------|------|
| **액터** | 학생 |
| **개요** | 학생이 장비 문제나 불편사항을 이슈로 등록하고 처리 현황을 확인한다. |
| **사전 조건** | 학생이 로그인된 상태 |
| **사후 조건** | 이슈가 `waiting` 상태로 DB에 저장되고 목록에 표시된다. |
| **기본 흐름** | 1. 이슈 관리 페이지 접속 → 2. 제목, 내용 입력 후 등록 → 3. 내 이슈 목록에서 처리 상태 확인 |
| **예외 흐름** | 제목/내용 미입력 → 입력 요청 |
| **관련 API** | `POST /api/issues`, `GET /api/issues/me` |

#### UC-09: 예약 승인 / 거절

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 학생의 예약 신청을 승인하거나 거절한다. |
| **사전 조건** | 관리자가 로그인된 상태이며 `waiting` 상태의 예약이 존재 |
| **사후 조건** | 승인: `reserved`로 변경 / 거절: 취소 사유와 함께 `cancelled`로 변경 |
| **기본 흐름** | 1. 예약 관리 페이지 접속 → 2. 대기 중 예약 목록 확인 → 3. 승인/거절 처리 |
| **예외 흐름** | `waiting` 아닌 예약에 승인/거절 시도 → 오류 |
| **관련 API** | `PATCH /api/reservations/:id/approve`, `PATCH /api/reservations/:id/reject` |

#### UC-10: 사용자 이용정지 / 복구

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 특정 학생의 계정을 이용정지하거나 복구한다. |
| **사전 조건** | 관리자가 로그인된 상태 |
| **사후 조건** | 사용자 계정의 `is_active` 상태가 변경된다. |
| **기본 흐름** | 1. 사용자 관리 페이지 접속 → 2. 학생 목록 확인 → 3. 이용정지: `is_active = false` / 복구: `is_active = true` |
| **예외 흐름** | 존재하지 않는 사용자 → 404 |
| **관련 API** | `GET /api/users`, `PATCH /api/users/:id` |

#### UC-11: 자원 관리

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 실습 자원을 등록, 수정하고 상태를 관리한다. |
| **사전 조건** | 관리자가 로그인된 상태 |
| **사후 조건** | 자원 정보가 DB에 저장되거나 상태가 변경된다. |
| **기본 흐름** | 1. 자원 관리 페이지 접속 → 2. 자원 등록(정보 입력 후 저장) → 3. 기존 자원 상태 변경(`active` / `maintenance` / `retired`) |
| **예외 흐름** | 필수 항목 미입력 → 입력 요청 |
| **관련 API** | `GET /api/resources`, `POST /api/resources`, `PATCH /api/resources/:id/status` |

#### UC-12: 공지사항 등록 / 수정 / 삭제

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 공지사항을 등록, 수정, 삭제한다. |
| **사전 조건** | 관리자가 로그인된 상태 |
| **사후 조건** | 공지사항이 DB에 저장, 수정, 또는 삭제된다. |
| **기본 흐름** | 1. 공지사항 관리 페이지 접속 → 2. 등록: 제목, 내용, 긴급 여부 입력 → 3. 수정/삭제: 기존 공지사항 선택 후 처리 |
| **예외 흐름** | 제목/내용 미입력 → 입력 요청 / 존재하지 않는 공지사항 → 404 |
| **관련 API** | `POST /api/notices`, `PATCH /api/notices/:id`, `DELETE /api/notices/:id` |

#### UC-13: 이슈 상태 변경 및 삭제

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 등록된 이슈의 처리 상태를 변경하고 완료된 이슈를 삭제한다. |
| **사전 조건** | 관리자가 로그인된 상태 |
| **사후 조건** | 이슈 상태가 변경되거나 삭제된다. |
| **기본 흐름** | 1. 이슈 관리 페이지 접속 → 2. 처리 시작: `waiting → in_progress` → 3. 처리 완료: `in_progress → resolved` → 4. 필요 시 삭제 |
| **예외 흐름** | 유효하지 않은 상태값 → 오류 / 존재하지 않는 이슈 → 404 |
| **관련 API** | `PATCH /api/issues/:id/status`, `DELETE /api/issues/:id` |

#### UC-14: 컨테이너 생성 및 종료

| 항목 | 내용 |
|------|------|
| **액터** | 관리자 |
| **개요** | 관리자가 Docker 컨테이너를 프리셋 기반으로 생성하고 종료한다. |
| **사전 조건** | 관리자가 로그인된 상태이며 Docker 환경이 구성된 상태 |
| **사후 조건** | 컨테이너가 생성되어 실행 중이거나, 종료 및 삭제된다. |
| **기본 흐름** | 1. Docker 제어 페이지 접속 → 2. 프리셋 목록 조회 → 3. 프리셋 선택 후 컨테이너 생성 → 4. 실행 중 컨테이너 선택 후 종료(stop & remove) |
| **예외 흐름** | 존재하지 않는 프리셋 → 오류 / Docker 미실행 환경 → 안내 메시지 |
| **관련 API** | `GET /api/containers/presets`, `GET /api/containers`, `POST /api/containers/run/:presetName`, `POST /api/containers/kill/:id` |

---

### 2-4. 예약 상태 전이

| 상태값 | 의미 | 전환 조건 |
|--------|------|-----------|
| `waiting` | 승인 대기 중 | 예약 신청 직후 기본값 |
| `reserved` | 예약됨 | 관리자가 승인했을 때 |
| `using` | 사용 중 | 학생이 사용 시작 버튼 클릭 시 |
| `completed` | 완료 | 사용 종료 클릭 또는 `end_time` 경과 시 자동 처리 |
| `cancelled` | 취소됨 | 학생이 직접 취소하거나 관리자가 거절했을 때 |

### 2-5. 이슈 상태 전이

| 상태값 | 의미 | 전환 조건 |
|--------|------|-----------|
| `waiting` | 접수 대기 중 | 이슈 등록 직후 기본값 |
| `in_progress` | 처리 중 | 관리자가 처리 시작으로 변경했을 때 |
| `resolved` | 처리 완료 | 관리자가 처리 완료로 변경했을 때 |

## 3. 설계

### 3-1. 시스템 아키텍처

```
[프론트엔드 : React + Vite]
        ↕ HTTP REST API (axios)
[백엔드 : Node.js + Express]
        ↕ Mongoose ODM
[데이터베이스 : MongoDB Atlas]

[Docker API (dockerode)]
        ↕
[Docker Engine (EC2)]
        ↕
[Prometheus + Grafana (모니터링)]
```

### 3-2. 클래스 다이어그램 (MongoDB 스키마)

#### User

| 필드 | 타입 | 설명 |
|------|------|------|
| _id | ObjectId | 기본 키 |
| name | String | 이름 |
| student_id | String | 학번 (unique) |
| email | String | 이메일 |
| password | String | bcrypt 해시 비밀번호 |
| role | String | student \| admin |
| max_reservations | Number | 최대 예약 횟수 (기본: 3) |
| current_reservations | Number | 현재 예약 수 (기본: 0) |
| is_active | Boolean | 계정 활성 여부 |
| refresh_token | String | JWT Refresh Token |

#### Resource

| 필드 | 타입 | 설명 |
|------|------|------|
| lab_id | String | 실습실 코드 |
| name | String | 자원 이름 |
| spec | Object | CPU, Memory, Storage, GPU 사양 |
| status | String | active \| maintenance \| retired |
| operating_hours | Object | 운영 요일, 시작/종료 시간, 최대 동시 예약 수 |
| created_by | ObjectId | 등록 관리자 (ref: User) |

#### Reservation

| 필드 | 타입 | 설명 |
|------|------|------|
| user_id | ObjectId | 예약자 (ref: User) |
| resource_id | ObjectId | 예약 자원 (ref: Resource) |
| start_time | Date | 시작 시각 |
| end_time | Date | 종료 시각 |
| status | String | waiting \| reserved \| using \| completed \| cancelled |
| approved_by | ObjectId | 승인 관리자 (ref: User) |
| cancel_reason | String | 취소/거절 사유 |
| actual_start_time | Date | 실제 사용 시작 시각 |
| actual_end_time | Date | 실제 사용 종료 시각 |
| container_info | Object | Docker 컨테이너 연결 정보 |

#### Notice / Issue / EmailVerification

- **Notice**: title, content, is_urgent, created_by
- **Issue**: title, content, status(waiting/in_progress/resolved), created_by, resolved_by
- **EmailVerification**: email, code, verified, expiresAt (TTL 인덱스, 5분 후 자동 삭제)

#### 클래스 간 관계

```
User  1 ──── N  Reservation (user_id)
User  1 ──── N  Reservation (approved_by)
Resource 1 ── N  Reservation (resource_id)
User  1 ──── N  Resource (created_by)
User  1 ──── N  Notice (created_by)
User  1 ──── N  Issue (created_by, resolved_by)
```

### 3-3. 순서도 (Flowchart)

전체 시스템 흐름은 아래와 같다.

1. **로그인** → 인증 성공/실패 분기 → 역할별(학생/관리자) 화면 이동
2. **학생 흐름**: 예약 신청 → 대기 → 관리자 승인 → 예약됨 → 시간 도래 → 사용 시작 → 사용 중 → 사용 완료
3. **관리자 흐름**: 예약 목록 조회 → 승인/거절/강제 회수 + 자원 관리 + 사용자 관리 + 공지/이슈 + Docker/Grafana

### 3-4. 시퀀스 다이어그램

#### 로그인 흐름
```
사용자 → 프론트엔드: 학번, 비밀번호 입력
프론트엔드 → 인증API: POST /api/auth/login
인증API → DB: 사용자 조회
[인증 성공] 비밀번호 검증 → 토큰 생성 → 200 OK (accessToken, refreshToken)
[인증 실패] 401 Unauthorized
```

#### 예약 신청 흐름
```
사용자 → 예약API: POST /api/reservations
예약API → DB: 자원 상태 확인
[자원 불가] 400/404 반환
[자원 가능] 운영시간 확인 → 중복 예약 조회
[중복 존재] 409 Conflict
[예약 가능] 예약 생성 → 201 Created
```

#### 예약 승인/거절 흐름
```
관리자 → 예약API: GET /api/reservations (권한 확인)
[승인] PATCH /api/reservations/:id/approve → status: reserved
[거절] PATCH /api/reservations/:id/reject → status: cancelled + cancel_reason
```

### 3-5. 충돌 방지 알고리즘

예약 신청 시 `validateReservation()` 함수에서 아래 순서로 유효성 검사를 수행한다.

```
1단계: 자원 상태 확인
  - 존재하지 않음 → 404
  - maintenance → 400
  - retired → 400

2단계: 운영 요일/시간 확인
  - 운영 요일(mon~fri) 외 → 400
  - 운영 시간(09:00~22:00) 외 → 400

3단계: 중복 예약 확인
  - 동일 자원, 동일 시간, status IN [waiting, reserved, using]
  - 완전 동일 시간 → 409 ("이미 동일한 예약이 존재합니다.")

4단계: 최대 동시 예약 수 확인
  - conflicts.length >= max_concurrent → 409 ("최대 동시 예약 수 초과")

✅ 모든 검사 통과 → 예약 생성
```

---

## 4. 구현

### 4-1. 개발 환경

| 구분 | 내용 |
|------|------|
| OS | Windows 11 |
| 에디터 | Visual Studio Code |
| 런타임 | Node.js v20 |
| 패키지 관리 | npm |
| 버전 관리 | Git / GitHub (develop 브랜치) |
| DB 클라이언트 | MongoDB Compass |
| API 테스트 | Thunder Client (VS Code 확장) |

### 4-2. 서버/클라이언트 구조

```
Client (React + Vite, localhost:5173)
    ↕ REST API
Server (Express, localhost:3000)
    ↕ Mongoose
MongoDB Atlas (Cloud)
```

### 4-3. 백엔드 기술 스택

| 라이브러리 | 용도 |
|-----------|------|
| express | HTTP 서버 프레임워크 |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT 토큰 발급/검증 |
| bcryptjs | 비밀번호 해싱 |
| nodemailer | 이메일 인증 코드 발송 (Gmail SMTP) |
| dockerode | Docker API 연동 |
| helmet | HTTP 보안 헤더 |
| express-rate-limit | API 요청 제한 |
| winston | 로깅 |
| dotenv | 환경변수 관리 |

### 4-4. 프론트엔드 기술 스택

| 라이브러리 | 용도 |
|-----------|------|
| React 18 | UI 프레임워크 |
| Vite | 빌드 도구 |
| axios | HTTP 클라이언트 (공통 인스턴스, 토큰 자동 첨부/갱신) |
| styled-components | CSS-in-JS 스타일링 |
| lucide-react | 아이콘 |

### 4-5. 주요 API 목록

#### 인증 API (`/api/auth`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | /register | 회원가입 (이메일 인증 완료 필수) |
| POST | /login | 로그인 (accessToken + refreshToken 발급) |
| POST | /refresh | 토큰 재발급 |
| POST | /logout | 로그아웃 |
| POST | /send-email | 이메일 인증 코드 발송 |
| POST | /verify-email | 이메일 인증 코드 검증 |

#### 예약 API (`/api/reservations`)

| 메서드 | 엔드포인트 | 권한 | 설명 |
|--------|-----------|------|------|
| POST | / | 학생/관리자 | 예약 신청 |
| GET | /me | 학생/관리자 | 내 예약 목록 (만료 예약 자동 completed) |
| GET | / | 관리자 | 전체 예약 목록 (날짜 필터 지원) |
| PATCH | /:id/cancel | 학생/관리자 | 예약 취소 |
| PATCH | /:id/approve | 관리자 | 예약 승인 |
| PATCH | /:id/reject | 관리자 | 예약 거절 |
| PATCH | /:id/start | 학생/관리자 | 사용 시작 |
| PATCH | /:id/end | 학생/관리자 | 사용 종료 / 강제 회수 |

#### 기타 API

| 경로 | 설명 |
|------|------|
| /api/users | 사용자 조회/수정/이용정지 |
| /api/resources | 자원 CRUD, 상태 변경 |
| /api/notices | 공지사항 CRUD |
| /api/issues | 이슈 등록/상태 변경/삭제 |
| /api/containers | Docker 컨테이너 조회/생성/종료 |

### 4-6. 이메일 인증 구현

Gmail SMTP와 nodemailer를 사용하여 회원가입 시 이메일 인증을 구현했다.

```
1. POST /api/auth/send-email
   → 6자리 랜덤 코드 생성
   → MongoDB EmailVerification 컬렉션에 저장 (TTL: 5분)
   → Gmail SMTP로 HTML 이메일 발송

2. POST /api/auth/verify-email
   → DB에서 코드 검증
   → 일치 시 verified: true 저장

3. POST /api/auth/register
   → 이메일 인증 완료(verified: true) 여부 확인
   → 미완료 시 400 반환
   → 완료 시 계정 생성 + 인증 기록 삭제
```

### 4-7. axios 공통 인스턴스

프론트엔드에서 `frontend/src/api/axios.js`로 공통 인스턴스를 구성하여 모든 API 요청에 적용했다.

- **토큰 자동 첨부**: 모든 요청 헤더에 `Authorization: Bearer {accessToken}` 자동 추가
- **토큰 만료 자동 갱신**: 401 응답 시 `refreshToken`으로 재발급 후 원래 요청 재시도
- **baseURL 환경변수**: `VITE_API_URL` 환경변수로 서버 주소 분리 관리

---

## 5. 실험 — 테스트 데이터와 결과

### 5-1. 이메일 인증 테스트

| TC-ID | 테스트명 | 입력 | 기대 결과 | 실제 결과 |
|-------|---------|------|----------|----------|
| TC-001 | 인증 코드 발송 성공 | 유효한 이메일 | 200 OK, 이메일 수신 | ✅ Pass |
| TC-004 | 올바른 코드 인증 성공 | 발송된 코드 | 200 OK, verified: true | ✅ Pass |
| TC-005 | 잘못된 코드 인증 실패 | 틀린 코드 | 400, 오류 메시지 | ✅ Pass |
| TC-006 | 만료된 코드 입력 | 5분 경과 코드 | 400, 만료 메시지 | ✅ Pass |
| TC-009 | 인증 미완료 회원가입 차단 | 미인증 상태 | 400, 인증 필요 메시지 | ✅ Pass |

### 5-2. 충돌 방지 알고리즘 테스트

| TC-ID | 테스트명 | 입력 | 기대 결과 | 실제 결과 |
|-------|---------|------|----------|----------|
| TC-020 | maintenance 자원 차단 | 점검 중 자원 | 400 | ✅ Pass |
| TC-022 | 운영일 외 차단 (토요일) | 토요일 날짜 | 400 | ✅ Pass |
| TC-023 | 운영시간 전 차단 (08:00) | 08:00~10:00 | 400 | ✅ Pass |
| TC-025 | 경계값 예약 성공 (09:00~22:00) | 09:00~22:00 | 201 Created | ✅ Pass |
| TC-026 | 완전 중복 예약 차단 | 동일 자원/시간 | 409 Conflict | ✅ Pass |
| TC-027 | 시간 겹침 차단 | max_concurrent 초과 | 409 Conflict | ✅ Pass |

### 5-3. 인증 미들웨어 테스트

| TC-ID | 테스트명 | 입력 | 기대 결과 | 실제 결과 |
|-------|---------|------|----------|----------|
| TC-072 | 토큰 없이 API 호출 | Authorization 헤더 없음 | 401 | ✅ Pass |
| TC-073 | 만료 토큰으로 호출 | 만료된 accessToken | 403 | ✅ Pass |
| TC-075 | 학생 토큰으로 관리자 API 호출 | 학생 토큰 | 403 | ✅ Pass |

---

## 6. 결론

### 6-1. 구현 결과 요약

| 구분 | 완료 여부 | 비고 |
|------|----------|------|
| 인증 시스템 (JWT + 이메일 인증) | ✅ 완료 | Gmail SMTP 연동 |
| 예약 API + 충돌 방지 알고리즘 | ✅ 완료 | 4단계 유효성 검사 |
| 자원 관리 API | ✅ 완료 | |
| 사용자 관리 API | ✅ 완료 | |
| 공지사항 CRUD API | ✅ 완료 | |
| 이슈 관리 CRUD API | ✅ 완료 | |
| Docker 컨테이너 API | ✅ 완료 | 인프라 담당 연동 |
| 프론트엔드 API 연동 | ✅ 완료 | axios 공통 인스턴스 |
| 실시간 알림 | 🔄 진행 중 | |
| 최종 배포 | 🔄 진행 중 | AWS EC2 |

### 6-2. 핵심 기여 사항

**MongoDB 스키마 설계**  
6개 컬렉션(User, Resource, Reservation, Notice, Issue, EmailVerification)을 설계하고, 예약-사용자-자원 간 ObjectId 참조 관계를 정의했다.

**예약 충돌 방지 알고리즘 구현**  
`validateReservation()` 함수에서 자원 상태 → 운영 요일/시간 → 중복 예약 → 최대 동시 예약 수의 4단계 유효성 검사를 구현하여, 동일 자원에 대한 시간 충돌과 중복 예약을 완벽하게 방지했다.

**이메일 인증 API 추가**  
Gmail SMTP + nodemailer로 이메일 인증 코드 발송 기능을 구현했다. MongoDB TTL 인덱스를 활용해 5분 후 인증 기록이 자동 삭제되도록 설계했다.

**프론트 연동 기반 구축**  
axios 공통 인스턴스(`axios.js`, `auth.js`)를 작성해 프론트팀에 제공하여, 토큰 처리 없이 API 호출에만 집중할 수 있는 환경을 구성했다.

### 6-3. 개선 가능한 점

- 현재 만료된 예약의 자동 completed 처리가 `GET /api/reservations/me` 호출 시점에만 동작하는데, 이를 스케줄러(cron job)로 전환하면 더 정확하게 처리할 수 있다.
- 이메일 인증 시 사용자가 실수로 페이지를 벗어나면 인증 코드가 재발송되어야 하는 UX 개선이 필요하다.
- Docker 컨테이너 API에 인증 미들웨어 적용이 완료되어야 보안이 완전히 확보된다.
