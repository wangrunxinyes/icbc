import { EOL } from "os";
import http from "http";

import {
  lastName,
  driverLicenseNumber,
  intervalBetweenEachRefresh
} from "./config.js";
import WebDriverHelper from "./libs/webDriverHelper.js";

// 打印配置
console.log("  __ ___      _ ___ \n (_   |  /\\  |_) |  \n __)  | /--\\ | \\ |  \n                    ");
console.log("------------- Configs ---------------");
console.log(`Last Name: ${lastName}`);
console.log(`Driver License Number: ${driverLicenseNumber}`);
console.log(`Keyword: ******${EOL}`);
console.log(`Interval Between Each Refresh: ${intervalBetweenEachRefresh}ms`);
console.log("-------------------------------------");

// 初始化
const Solution = new WebDriverHelper();
let running = false;

// 可复用的执行函数
async function startBot() {
  if (running) return;
  running = true;
  try {
    await Solution.findAppointment();
  } catch (e) {
    console.error("FATAL ERROR:", e);
  } finally {
    running = false;
  }
}

// ✅ 默认一启动就运行
startBot();

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      data: {
        selectedDate: Solution.selectDate || null
      }
    }));
    return;
  }

  else if (req.method === "GET" && req.url.startsWith("/code")) {
    let code = null;
    try {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      code = parsedUrl.searchParams.get("code");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid URL format" }));
      return;
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing 'code' query parameter" }));
      return;
    }

    console.log("✅ 收到验证码：", code);
    Solution.verificationCode = code;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "received",
      data: {
        selectedDate: Solution.selectDate || null,
        code
      }
    }));
    return;
  }

  // fallback: not found
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/status`);
  console.log(`🔗 http://localhost:${PORT}/code?code=123456`);
});

