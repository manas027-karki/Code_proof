import http from "http";
import https from "https";

const DEFAULT_API_BASE = "https://code-proof.onrender.com/api";
const LOCAL_API_BASE = "http://localhost:4000/api";

function resolveApiBase() {
  const env = String(process.env.NODE_ENV || "").toLowerCase();
  if (env === "development") {
    return LOCAL_API_BASE;
  }
  return DEFAULT_API_BASE;
}

export async function checkUsageOrThrow({ clientId, config }) {
  const apiBase = resolveApiBase();
  const endpoint = `${apiBase}/usage/check-and-increment`;
  const payload = JSON.stringify({ clientId });

  return new Promise((resolve, reject) => {
    try {
      const url = new URL(endpoint);
      const transport = url.protocol === "http:" ? http : https;
      const portNumber = url.port
        ? parseInt(url.port, 10)
        : url.protocol === "http:"
          ? 80
          : 443;

      const request = transport.request(
        {
          method: "POST",
          hostname: url.hostname,
          port: portNumber,
          path: `${url.pathname}${url.search}`,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
          timeout: 5000,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            if (res.statusCode !== 200) {
              reject(new Error(`Usage check failed (${res.statusCode})`));
              return;
            }

            try {
              const data = body ? JSON.parse(body) : null;
              if (!data || typeof data.allowed !== "boolean") {
                reject(new Error("Invalid usage response"));
                return;
              }
              resolve(data);
            } catch (error) {
              reject(new Error("Invalid usage response"));
            }
          });
          res.resume();
        }
      );

      request.on("timeout", () => {
        request.destroy();
        reject(new Error("Usage check timeout"));
      });

      request.on("error", (err) => {
        reject(new Error(`Usage check error: ${err.message}`));
      });

      request.write(payload);
      request.end();
    } catch (error) {
      reject(new Error("Usage check failed"));
    }
  });
}
