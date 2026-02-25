import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/brokers/oauth/mock-authorize
 * Mock OAuth authorization page for development
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const broker = searchParams.get("broker");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  if (!broker || !redirectUri || !state) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Generate a mock authorization code
  const mockCode = `mock_auth_code_${broker}_${Date.now()}`;

  // HTML page that simulates broker login
  return new NextResponse(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mock ${broker.toUpperCase()} Login</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
          color: #0f0f1e;
          margin-bottom: 10px;
          font-size: 24px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        .info-box {
          background: #f0f4ff;
          border-left: 4px solid #0066ff;
          padding: 15px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        .info-box p {
          color: #333;
          font-size: 13px;
          line-height: 1.6;
        }
        .code {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          color: #0066ff;
          word-break: break-all;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #0066ff;
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
        }
        .button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .button:active {
          transform: translateY(0);
        }
        .divider {
          text-align: center;
          margin: 20px 0;
          color: #999;
          font-size: 13px;
        }
        .test-button {
          width: 100%;
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .test-button:hover {
          background: #218838;
          transform: translateY(-2px);
        }
        .error {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Mock ${broker.toUpperCase()} Login</h1>
        <p class="subtitle">Development Mode - Testing Only</p>

        <div class="info-box">
          <p>
            <strong>ℹ️ This is a mock login page for development.</strong><br><br>
            In production, you would be redirected to ${broker.toUpperCase()}'s real OAuth page.
            For testing, autorisation is automatically granted.
          </p>
        </div>

        <form id="loginForm" onsubmit="handleLogin(event)">
          <input type="text" placeholder="Mock Email (any value)" id="email" value="demo@example.com" />
          <input type="password" placeholder="Mock Password (any value)" id="password" value="password123" />

          <button type="submit" class="button">✓ Authorize & Continue</button>
          
          <div class="divider">OR</div>

          <button type="button" class="test-button" onclick="skipLoginAndAuthorize()">
            ⚡ Skip & Auto-Authorize
          </button>
        </form>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999;">
          State: <span class="code">${state}</span>
        </div>
      </div>

      <script>
        function handleLogin(e) {
          e.preventDefault();
          authorized();
        }

        function skipLoginAndAuthorize() {
          authorized();
        }

        function authorized() {
          // Redirect to callback with mock code
          const params = new URLSearchParams({
            code: '${mockCode}',
            state: '${state}',
            broker: '${broker}'
          });
          window.location.href = '${redirectUri}?' + params.toString();
        }
      </script>
    </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" },
  });
}
