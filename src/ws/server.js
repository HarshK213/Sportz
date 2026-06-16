import { WebSocket, WebSocketServer } from "ws";

const matchSubscirbers = new Map();

function subscribe(matchId, socket) {
    if (!matchSubscirbers.has(matchId)) {
        matchSubscirbers.set(matchId, new Set());
    }
    matchSubscirbers.get(matchId).add(socket);
}

function unsubscibe(matchId, socket) {
    const subscribers = matchSubscirbers.get(matchId);
    if (!subscribers) return;
    subscirbers.delete(socket);
    if (subscribers.size === 0) {
        matchSubscirbers.delete(matchId);
    }
}

function clearnupSubscriptions(socket) {
    for (const matchId of socket.subscriptions) {
        unsubscibe(matchId, socket);
    }
}

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;
        client.send(JSON.stringify(payload));
    }
}

function broadcastToMatch(matchId, payload) {
    const subscirbers = matchSubscirbers.get(matchId);
    if (!subscirbers || subscirbers.size === 0) return;
    const message = JSON.stringify(payload);
    for (const client of subscirbers) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

function handleMessage(socket, data) {
    let message;
    try {
        message = JSON.parse(data.toString());
    } catch {
        sendJson(socket, { type: 'error', message: 'Invalid JSON' });
    }

    if (message?.type === 'subscribe' && Number.isInteger(message.matchId)) {
        subscribe(message.matchId, socket);
        socket.subscriptions.add(message.matchId);
        sendJson(socket, { type: 'subscribed', matchId: message.matchId });
        return;
    }

    if (message?.type === 'unsubscribe' && Number.isInteger(message.matchId)) {
        unsubscibe(message.matchId, socket);
        socket.subscriptions.delete(message.matchId);
        sendJson(socket, { type: 'unsubscribed', matchId: message.matchId });
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
        verifyClient: (info) => {
            const allowedOrigins = [
                process.env.ALLOWED_ORIGIN || "http://localhost:3000",
            ];
            const origin = info.origin || info.req.headers.origin;
            return !origin || allowedOrigins.includes(origin);
        },
    });
    wss.on("connection", async(socket,req) => {
        socket.isAlive = true;
        socket.on('pong', () => { socket.isAlive = true; });

        socket.subscriptions = new Set();

        sendJson(socket, { type: "welcome" });

        socket.on('message', (data) => {
            handleMessage(socket, data)
        });

        socket.on('error', () => {
            socket.terminate();
        })

        socket.on('close', () => {
            clearnupSubscriptions(socket);
        })

        socket.on("error", console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        })
    }, 3000);

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: "match_created", data: match });
    }

    function broadCommentary(matchId, comment) {
        broadcastToMatch(matchId, { type: 'commentary', data: comment });
    }

    return { broadcastMatchCreated, broadCommentary };
}
