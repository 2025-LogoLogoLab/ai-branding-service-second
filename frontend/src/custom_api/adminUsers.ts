// src/custom_api/adminUsers.ts
// 관리자 전용 회원 관리 API 클라이언트 모음

// 관리자 전용 회원 관리 API 래퍼.
// - 실서버 호출(default)과 UI 테스트용 mock(toggle) 둘 다 지원.
// - 목록/생성/상세/수정/삭제 공통 타입을 한 군데에서 관리.
const baseUrl = import.meta.env.VITE_API_BASE_URL;
// VITE_API_BASE_URL already includes "/api", so avoid duplicating it here
const adminBase = `${baseUrl}/admin`;

// TEMP MOCK: 로컬 UI 확인용 더미 데이터. 필요 없으면 false 고정 또는 제거.
const USE_ADMIN_MOCK = false;

const mockUsers: AdminUserRecord[] = [
    {
        id: 1,
        provider: "KAKAO",
        role: "ADMIN",
        profileImage: null,
        nickname: "어드민(홍길동)",
        email: "admin@example.com",
        phone: "010-1111-2222",
        emailNoti: true,
        smsNoti: false,
        newsLetter: true,
    },
    {
        id: 2,
        provider: "LOCAL",
        role: "USER",
        profileImage: null,
        nickname: "테스터 김",
        email: "tester@example.com",
        phone: "010-3333-4444",
        emailNoti: false,
        smsNoti: true,
        newsLetter: false,
    },
    {
        id: 3,
        provider: "NAVER",
        role: "USER",
        profileImage: null,
        nickname: "마케팅 팀",
        email: "marketer@example.com",
        phone: "010-5555-6666",
        emailNoti: true,
        smsNoti: true,
        newsLetter: true,
    },
];

const mockDelay = async <T>(value: T, ms = 200): Promise<T> =>
    new Promise((resolve) => setTimeout(() => resolve(value), ms));

export type AdminUserRole = "ADMIN" | "USER";

export type AdminUserRecord = {
    id: number;
    provider?: string | null;
    role: AdminUserRole;
    profileImage: string | null;
    nickname: string;
    email: string;
    phone: string;
    emailNoti: boolean;
    smsNoti: boolean;
    newsLetter: boolean;
};

export type AdminUserListResponse = {
    content: AdminUserRecord[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};

export type AdminUserCreateRequest = {
    email: string;
    password: string;
    nickname: string;
    role: AdminUserRole;
};

export type AdminUserUpdateRequest = {
    profileImage?: string | null;
    nickname?: string;
    emailNoti?: boolean;
    smsNoti?: boolean;
    newsLetter?: boolean;
    phone?: string;
    role?: AdminUserRole;
};

const readMessage = async (res: Response, fallback: string) => {
    try {
        const data = await res.json();
        if (typeof data?.message === "string") return data.message;
    } catch {
        // ignore
    }
    return `${fallback} (HTTP ${res.status})`;
};

const handleJson = async <T>(res: Response, fallback: string): Promise<T> => {
    if (!res.ok) {
        throw new Error(await readMessage(res, fallback));
    }
    return res.json();
};

const buildQuery = (page: number, size: number, sort?: string[]) => {
    const params = new URLSearchParams();
    params.set("page", String(Math.max(0, page)));
    params.set("size", String(Math.max(1, size)));
    sort?.forEach((value) => {
        if (value) params.append("sort", value);
    });
    const query = params.toString();
    return query ? `?${query}` : "";
};

export async function fetchAdminUsers(params: { page?: number; size?: number; sort?: string[] } = {}): Promise<AdminUserListResponse> {
    if (USE_ADMIN_MOCK) {
        const { page = 0, size = 10 } = params;
        const start = Math.max(0, page * size);
        const end = start + size;
        const content = mockUsers.slice(start, end);
        const totalElements = mockUsers.length;
        const totalPages = Math.max(1, Math.ceil(totalElements / size));
        return mockDelay({
            content,
            totalElements,
            totalPages,
            size,
            number: page,
        });
    }

    const { page = 0, size = 10, sort } = params;
    const res = await fetch(`${adminBase}/users${buildQuery(page, size, sort)}`, {
        method: "GET",
        credentials: "include",
    });
    return handleJson<AdminUserListResponse>(res, "회원 목록 조회에 실패했습니다.");
}

export async function createAdminUser(payload: AdminUserCreateRequest): Promise<AdminUserRecord> {
    if (USE_ADMIN_MOCK) {
        const next: AdminUserRecord = {
            id: mockUsers.length ? Math.max(...mockUsers.map((u) => u.id)) + 1 : 1,
            provider: "LOCAL",
            profileImage: null,
            phone: "",
            emailNoti: false,
            smsNoti: false,
            newsLetter: false,
            ...payload,
        };
        mockUsers.unshift(next);
        return mockDelay(next);
    }

    const res = await fetch(`${adminBase}/user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleJson<AdminUserRecord>(res, "회원 생성에 실패했습니다.");
}

export async function getAdminUser(userId: number): Promise<AdminUserRecord> {
    if (USE_ADMIN_MOCK) {
        const found = mockUsers.find((u) => u.id === userId);
        if (!found) {
            throw new Error("해당 ID의 회원을 찾을 수 없습니다.");
        }
        return mockDelay({ ...found });
    }

    const res = await fetch(`${adminBase}/user/${userId}`, {
        method: "GET",
        credentials: "include",
    });
    return handleJson<AdminUserRecord>(res, "회원 상세 조회에 실패했습니다.");
}

export async function updateAdminUser(userId: number, payload: AdminUserUpdateRequest): Promise<AdminUserRecord> {
    if (USE_ADMIN_MOCK) {
        const idx = mockUsers.findIndex((u) => u.id === userId);
        if (idx === -1) {
            throw new Error("해당 ID의 회원을 찾을 수 없습니다.");
        }
        const updated: AdminUserRecord = { ...mockUsers[idx], ...payload };
        mockUsers[idx] = updated;
        return mockDelay(updated);
    }

    const res = await fetch(`${adminBase}/user/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });
    return handleJson<AdminUserRecord>(res, "회원 정보 수정에 실패했습니다.");
}

export async function deleteAdminUser(userId: number): Promise<{ message?: string }> {
    if (USE_ADMIN_MOCK) {
        const idx = mockUsers.findIndex((u) => u.id === userId);
        if (idx === -1) {
            throw new Error("해당 ID의 회원을 찾을 수 없습니다.");
        }
        mockUsers.splice(idx, 1);
        return mockDelay({ message: `회원(${userId}) 삭제 완료` });
    }

    const res = await fetch(`${adminBase}/user/${userId}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) {
        throw new Error(await readMessage(res, "회원 삭제에 실패했습니다."));
    }
    try {
        return await res.json();
    } catch {
        return { message: "삭제되었습니다." };
    }
}
