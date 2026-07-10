import assert from "node:assert/strict";
import test from "node:test";
import { Buffer } from "node:buffer";
import {
  decodePiSessionHtml,
  normalizeFolderName,
  redactSensitive,
  redactText,
  slugify
} from "../scripts/showcase-core";

test("normalizes numbered experiment folder conventions", () => {
  assert.deepEqual(normalizeFolderName("8_Nitro_League"), {
    order: 8,
    slug: "nitro-league",
    title: "Nitro League"
  });
  assert.deepEqual(normalizeFolderName("10. whispering-pines"), {
    order: 10,
    slug: "whispering-pines",
    title: "Whispering Pines"
  });
  assert.equal(slugify("Needle & Groove"), "needle-and-groove");
});

test("redacts private paths and secret-like values recursively", () => {
  const text = redactText("Read C:\\Program Files\\Private App\\secret.txt and /home/person/.env with Bearer abcdefghijklmnop");
  assert.equal(text.includes("C:\\Program Files"), false);
  assert.equal(text.includes("/home/person"), false);
  assert.equal(text.includes("abcdefghijklmnop"), false);

  const value = redactSensitive({
    apiKey: "sk-example-1234567890",
    monkey: "kept",
    nested: { path: "C:\\CreativeOS\\project\\index.html", note: "AKIAABCDEFGHIJKLMNOP" }
  }) as Record<string, unknown>;
  assert.equal(value.apiKey, "[redacted]");
  assert.equal(value.monkey, "kept");
  assert.match(JSON.stringify(value), /\[local-path\]/);
  assert.match(JSON.stringify(value), /\[redacted-secret\]/);
  assert.equal(JSON.stringify(value).includes("CreativeOS"), false);
});

test("decodes Pi exports while excluding thinking, tool arguments, and system data", () => {
  const session = {
    header: { id: "session-1", timestamp: "2026-07-10T00:00:00.000Z", cwd: "C:\\Private\\Repo" },
    systemPrompt: "Never publish this system prompt",
    tools: [{ name: "write", secret: "hidden" }],
    entries: [
      { type: "model_change", modelId: "gpt-5.6-terra", provider: "oauth-router" },
      {
        type: "message",
        id: "u1",
        timestamp: "2026-07-10T00:00:01.000Z",
        message: { role: "user", content: [{ type: "text", text: "Build a beautiful archive." }] }
      },
      {
        type: "message",
        id: "a1",
        message: {
          role: "assistant",
          model: "gpt-5.6-terra",
          content: [
            { type: "thinking", thinking: "Private chain of thought" },
            { type: "text", text: "I’ll create it." },
            { type: "toolCall", name: "write", arguments: { path: "C:\\Private\\Repo\\index.html", content: "sensitive source" } }
          ]
        }
      },
      {
        type: "message",
        id: "t1",
        message: {
          role: "toolResult",
          toolName: "write",
          content: [{ type: "text", text: "Wrote C:\\Private\\Repo\\index.html" }]
        }
      }
    ]
  };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64");
  const html = `<script data-export="pi" type="application/json" id="session-data">${payload}</script>`;
  const decoded = decodePiSessionHtml(html);
  const publicJson = JSON.stringify(decoded.transcript);

  assert.equal(decoded.transcript.session.modelId, "gpt-5.6-terra");
  assert.equal(decoded.transcript.stats.toolCalls, 1);
  assert.equal(decoded.firstUserText, "Build a beautiful archive.");
  assert.equal(publicJson.includes("system prompt"), false);
  assert.equal(publicJson.includes("Private chain"), false);
  assert.equal(publicJson.includes("sensitive source"), false);
  assert.equal(publicJson.includes("C:\\Private"), false);
  assert.match(publicJson, /Created or replaced a project file/);
});
