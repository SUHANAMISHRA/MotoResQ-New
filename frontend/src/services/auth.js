
const API_URL = "http://127.0.0.1:8001";

async function request(path, data) {
    const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        const message =
            typeof result.detail === "string"
                ? result.detail
                : "Something went wrong. Please try again.";

        throw new Error(message);
    }

    return result;
}

export function signup(name, email, password) {
    return request("/api/auth/signup", {
        name,
        email,
        password,
    });
}

export function login(email, password) {
    return request("/api/auth/login", {
        email,
        password,
    });
}
