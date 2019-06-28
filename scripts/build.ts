import chalk from "chalk";
import "../test/testing/test-console";
import { serverless } from "./lib/serverless";
import { transpileJavascript, clearTranspiledJS } from "./lib/js";

function prepOutput(output: string) {
  return output
    .replace(/\t\r\n/, "")
    .replace("undefined", "")
    .trim();
}

(async () => {
  const scope: string[] = process.argv.slice(2).filter(s => s[0] !== "-");
  const options = new Set(
    process.argv
      .slice(2)
      .filter(s => s[0] === "-")
      .map(o => o.replace(/^-+/, ""))
  );

  try {
    await clearTranspiledJS();
    await transpileJavascript();
  } catch (e) {
    console.error(chalk.red("- Problem transpiling Javascript!"), e);
    process.exit(1);
  }

  console.log("\n");
})();
