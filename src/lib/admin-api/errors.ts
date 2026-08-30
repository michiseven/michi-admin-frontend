export class AdminApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;

  constructor(message: string, code = "ADMIN_API_ERROR", status = 500, requestId?: string) {
    super(message);
    this.name = "AdminApiError";
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

export class NotFoundError extends AdminApiError {
  constructor(message = "요청한 리소스를 찾을 수 없습니다.", code = "ADMIN_NOT_FOUND", requestId?: string) {
    super(message, code, 404, requestId);
    this.name = "NotFoundError";
  }
}

export class NetworkError extends AdminApiError {
  constructor(message = "관리자 서버와 통신할 수 없습니다. 서버 실행 상태를 확인해 주세요.", requestId?: string) {
    super(message, "NETWORK_ERROR", 0, requestId);
    this.name = "NetworkError";
  }
}
