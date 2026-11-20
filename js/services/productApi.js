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

export async function request(path, options = {}) {
    const controller = new AbortController();

    let timedOut = false;

    const timeoutId = setTimeout( () => {
        timedOut = true;
        controller.abort();
    }, REQUEST_TIMEOUT);

    const method = options.method || "GET";

    const headers = {
        "Accept": "application/json",
        ...options.headers
    };

    const fetchOptions = {
        ...options,
        method,
        headers,
        signal: controller.signal
    };

    delete fetchOptions.body;

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(options.body);
    }

    const URL = `${API_BASE_URL}${path}`;

    try {
        if (typeof navigator !== "undefined" && !navigator.onLine === false) {
            throw new ApiError(
                "offline",
                null,
                "Vous êtes hors ligne."
            )
        }

        const response = await fetch(URL, fetchOptions);
        const responseText = await response.text();

        if (!response.ok) {
            throw new ApiError(
                "http",
                response.status,
                `Error HTTP: ${response.status}`
            )
        }

        if (!responseText) {
            return null;
        }

        try {
            return JSON.parse(responseText);
        } catch {
            throw new ApiError(
                "parse",
                response.status,
                "La réponse du serveur est invalide."
            )
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (timedOut) {
            throw new ApiError(
                "timeout",
                null,
                "La requête a dépassé le délai de 8 secondes."
            );
        }

        if (typeof navigator !== "undefined" && navigator.onLine === false) {
            throw new ApiError(
                "offline",
                null,
                "Vous êtes hors ligne."
            );
        }

        throw new ApiError(
            "network",
            null,
            "Impossible de contacter le serveur."
        )
    } finally {
        clearTimeout(timeoutId);
    }
}