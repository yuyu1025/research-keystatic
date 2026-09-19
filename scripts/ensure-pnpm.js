const ua = process.env.npm_config_user_agent ?? "";
const pm = ua.split(" ")[0]?.split("/")[0] ?? "";

if (pm === "pnpm") {
  process.exit(0);
}

console.error(`
这个项目只用 pnpm，不要用 ${pm || "npm"}。

  pnpm install
  pnpm dev
`);
process.exit(1);
