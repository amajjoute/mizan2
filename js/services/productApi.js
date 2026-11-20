const API_BASE_URL = "http://localhost:3000";
const REQUEST_TIMEOUT = 8000;

class ApiError extends Error {
    constructor(type, status, message) {
        super(message);
        this.name = "ApiError";
        this.type = type;
        this.status = status;
    }
}
