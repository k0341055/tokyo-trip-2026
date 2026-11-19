// 把完整頁面用 AES-256-GCM 加密，產生需要密碼才能打開的 index.html。
// 金鑰由密碼經 PBKDF2-SHA256（600,000 次）導出；salt 固定（crypt-salt.txt），
// 所以更新內容後，已經記住密碼的手機不用重新輸入。
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const [src, out] = process.argv.slice(2);
const password = (process.env.TRIP_PASSWORD || readFileSync(".trip-password", "utf8")).trim().toLowerCase(); // 密碼不分大小寫（輸入頁也會轉小寫）
if (!password) throw new Error("missing password");
const saltHex = readFileSync("crypt-salt.txt", "utf8").trim();
const salt = Uint8Array.from(saltHex.match(/../g), (h) => parseInt(h, 16));
const ITER = 600000;

const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base,
  { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(readFileSync(src, "utf8"))));
const b64 = (u) => Buffer.from(u).toString("base64");
const payload = JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) });

const gate = readFileSync("gate.html", "utf8").replace("__PAYLOAD__", () => payload);
writeFileSync(out, gate);
console.log(`wrote ${out} (${gate.length} bytes, ciphertext ${ct.length} bytes)`);
