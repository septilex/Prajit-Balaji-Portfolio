const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const compiled = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, "../lib/contact.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;

function loadSender(fetch, key = "test-key") {
  const context = { exports: {}, fetch, AbortSignal, process: { env: { NEXT_PUBLIC_WEB3FORMS_KEY: key } } };
  vm.runInNewContext(compiled, context);
  return context.exports.sendContactInquiry;
}

const inquiry = { name: " Test Visitor ", email: " test@example.com ", message: " Test inquiry " };

test("missing configuration fails before any request", async () => {
  const send = loadSender(() => assert.fail("Must not send without a key"), "");
  await assert.rejects(send(inquiry), /email prajitk299@gmail.com directly/);
});

test("successful delivery sends trimmed fields with a timeout", async () => {
  const send = loadSender(async (url, options) => {
    assert.equal(url, "https://api.web3forms.com/submit");
    assert.equal(options.method, "POST");
    assert.ok(options.signal instanceof AbortSignal);
    assert.deepEqual(JSON.parse(options.body), {
      access_key: "test-key", name: "Test Visitor", email: "test@example.com", message: "Test inquiry",
    });
    return { ok: true, json: async () => ({ success: true }) };
  });
  await send(inquiry);
});

test("HTTP errors cannot be reported as success", async () => {
  const send = loadSender(async () => ({ ok: false, json: async () => ({ success: true }) }));
  await assert.rejects(send(inquiry), /could not be sent/);
});

test("a rejected or malformed service result cannot be reported as success", async () => {
  for (const result of [{ success: false }, {}, { success: "true" }]) {
    const send = loadSender(async () => ({ ok: true, json: async () => result }));
    await assert.rejects(send(inquiry), /could not be sent/);
  }
});

test("network failures propagate for the form to display", async () => {
  const send = loadSender(async () => { throw new Error("Network unavailable"); });
  await assert.rejects(send(inquiry), /Network unavailable/);
});
