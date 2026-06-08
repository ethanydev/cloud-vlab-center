# DB 스키마 설계

## 목차
1. [User (사용자)](#1-user-사용자)
2. [Resource (실습 자원)](#2-resource-실습-자원)
3. [Reservation (예약)](#3-reservation-예약)

---

## 1. User (사용자)

| 필드명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| _id | ObjectId | 고유 식별자 | 자동 생성 |
| name | String | 사용자 이름 | 필수 |
| student_id | String | 학번 | 로그인 아이디로 사용, 중복 불가 |
| email | String | 학교 이메일 | 필수 |
| password | String | 비밀번호 | bcrypt 암호화 필수 |
| role | String | 권한 | `student`(기본값) / `admin` |
| max_reservations | Number | 최대 예약 가능 횟수 | 기본값 3 |
| current_reservations | Number | 현재 예약 중인 횟수 | 동적 업데이트 |
| is_active | Boolean | 계정 활성화 여부 | 기본값 true, 탈퇴 시 false (소프트 딜리트) |
| refresh_token | String | JWT 리프레시 토큰 | 로그아웃 시 null로 초기화 |
| createdAt | Date | 계정 생성 시각 | 자동 생성 |
| updatedAt | Date | 계정 정보 수정 시각 | 자동 업데이트 |

---

## 2. Resource (실습 자원)

| 필드명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| _id | ObjectId | 고유 식별자 | 자동 생성 |
| lab_id | String | 실습실 번호 | 예: `IT-504` |
| name | String | 자원 이름 | 예: `GPU Server A` |
| spec.cpu | String | CPU 정보 | 예: `Intel Xeon ...` |
| spec.memory | String | 메모리 정보 | |
| spec.storage | String | 스토리지 정보 | |
| spec.gpu | String | GPU 정보 | |
| spec.description | String | 통합 자원 설명 | |
| status | String | 자원 상태 | `active` / `maintenance` / `retired` |
| operating_hours.days | Array\<String\> | 운영 요일 | 예: `["Mon","Tue","Wed","Thu","Fri"]` |
| operating_hours.start_time | String | 운영 시작 시간 | 예: `"09:00"` |
| operating_hours.end_time | String | 운영 종료 시간 | 예: `"22:00"` |
| operating_hours.max_concurrent | Number | 동시 예약 허용 수 | 기본값 1 |
| equipment | Array\<String\> | 보유 장비 목록 | |
| created_by | ObjectId | 등록한 관리자 | User 컬렉션 참조 |
| createdAt | Date | 등록 시각 | 자동 생성 |
| updatedAt | Date | 수정 시각 | 자동 업데이트 |

---

## 3. Reservation (예약)

| 필드명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| _id | ObjectId | 고유 식별자 | 자동 생성 |
| user_id | ObjectId | 예약한 사용자 | User 컬렉션 참조 |
| resource_id | ObjectId | 예약한 자원 | Resource 컬렉션 참조 |
| start_time | Date | 예약 시작 시간 | 필수 |
| end_time | Date | 예약 종료 시간 | 필수 |
| purpose | String | 사용 목적 | 필수 |
| status | String | 예약 상태 | 아래 status 표 참고 |
| approved_by | ObjectId | 승인한 관리자 | User 컬렉션 참조, 기본값 null |
| cancel_reason | String | 취소/거절 사유 | 기본값 null |
| actual_start_time | Date | 실제 사용 시작 시각 | 기본값 null |
| actual_end_time | Date | 실제 사용 종료 시각 | 기본값 null |
| createdAt | Date | 예약 신청 시각 | 자동 생성 |
| updatedAt | Date | 예약 수정 시각 | 자동 업데이트 |

### 예약 Status 값

| status | 의미 | 전환 조건 |
|--------|------|----------|
| `waiting` | 승인 대기 중 | 예약 신청 직후 기본값 |
| `reserved` | 예약됨 | 관리자가 승인했을 때 |
| `using` | 사용 중 | 실제 사용 시작했을 때 |
| `cancelled` | 취소됨 | 사용자가 직접 취소하거나 관리자가 거절했을 때 |
| `completed` | 완료 | 사용 종료 후 반납됐을 때 |

> ⚠️ `cancelled` 상태일 때 `cancel_reason` 필드에 취소/거절 사유가 저장됩니다.
