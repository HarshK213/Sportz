const loadConfig = () => {
    const port = parseInt(process.env.PORT || "8000", 10);
    if (isNaN(port)) {
        throw new Error("Port must be valid number.");
    }

    const host = process.env.HOST || "0.0.0.0";
    if (!host) {
        throw new Error("HOST must be a valid IP");
    }

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
