const loadConfig = () => {
    const port = parseInt(process.env.PORT || "8000", 10);
    if (isNaN(port)) {
        throw new Error("Port must be valid number.");
    }

    const hostEnv = process.env.HOST;
    if (hostEnv !== undefined && hostEnv.trim() === "") {
        throw new Error("HOST must be a valid IP, not empty string");
    }
    const host = hostEnv || "0.0.0.0";

    const dbUri = process.env.DATABASE_URL;
    if (!dbUri) {
        throw new Error("DATABASE_URL environment variable is required.");
    }

    return {
        PORT: port,
        HOST: host,
        DATABASE_URL: dbUri,
    };
};

export const env = loadConfig();
