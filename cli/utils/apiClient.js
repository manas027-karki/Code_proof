import http from "http";
import https from "https";

// Boundary: integration layer only. Must not import CLI, rule engine, or reporting.
// Network calls are fail-open to avoid impacting commits or developer flow.

const DEFAULT_ENDPOINT = "http://127.0.0.1:4000/api/reports";

export async function sendReportToServer(report, options = {}) {
  const enabled = Boolean(options.enabled);
  
  // console.log("[API Client] sendReportToServer called");
  // console.log("[API Client] enabled:", enabled);
  // console.log("[API Client] options:", JSON.stringify(options, null, 2));
  
  if (!enabled) {
    // console.log("[API Client] Integration disabled, skipping");
    return;
  }

  const endpointUrl = typeof options.endpointUrl === "string" && options.endpointUrl.trim()
    ? options.endpointUrl.trim()
    : DEFAULT_ENDPOINT;

  console.log("[API Client] Sending report to:", endpointUrl);
  // console.log("[API Client] Report summary:", {
  //   projectId: report.projectId,
  //   clientId: report.clientId,
  //   findingsCount: report.findings?.length || 0
  // });

  return new Promise((resolve) => {
    try {
      const url = new URL(endpointUrl);
      const payload = JSON.stringify(report);
      const transport = url.protocol === "http:" ? http : https;

      // console.log("[API Client] URL parsed - protocol:", url.protocol, "hostname:", url.hostname, "port:", url.port, "pathname:", url.pathname);
      // console.log("[API Client] Payload size:", Buffer.byteLength(payload), "bytes");
      // console.log("[API Client] Payload preview:", payload.substring(0, 200) + "...");

      const portNumber = url.port ? parseInt(url.port, 10) : (url.protocol === "http:" ? 80 : 443);
      
      // console.log("[API Client] Sending POST to:", `${url.protocol}//${url.hostname}:${portNumber}${url.pathname}`);

      const request = transport.request(
        {
          method: "POST",
          hostname: url.hostname,
          port: portNumber,
          path: `${url.pathname}${url.search}`,
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
          },
          timeout: 5000
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => {
            body += chunk;
          });
          res.on("end", () => {
            if (res.statusCode === 201) {
              // Report sent successfully
              resolve({ success: true, statusCode: res.statusCode });
            } else {
              // Log error response for debugging
              let errorMessage = `Server returned status ${res.statusCode}`;
              try {
                const errorData = body ? JSON.parse(body) : null;
                if (errorData?.message) {
                  errorMessage += `: ${errorData.message}`;
                } else if (body) {
                  errorMessage += `: ${body.substring(0, 200)}`;
                }
              } catch {
                if (body) {
                  errorMessage += `: ${body.substring(0, 200)}`;
                }
              }
              console.error("[API Client]", errorMessage);
              resolve({ success: false, statusCode: res.statusCode, error: errorMessage });
            }
          });
          res.resume();
        }
      );

      request.on("timeout", () => {
        const errorMsg = "Request timeout after 5s";
        console.error("[API Client]", errorMsg);
        request.destroy();
        resolve({ success: false, error: errorMsg });
      });

      request.on("error", (err) => {
        const errorMsg = `Request error: ${err.message}`;
        console.error("[API Client]", errorMsg);
        resolve({ success: false, error: errorMsg });
      });

      request.write(payload);
      request.end();
      // console.log("[API Client] Request sent");
    } catch (err) {
      const errorMsg = `Exception: ${err.message}`;
      console.error("[API Client]", errorMsg);
      resolve({ success: false, error: errorMsg });
    }
  });
}
