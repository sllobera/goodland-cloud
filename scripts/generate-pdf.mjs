import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function toFileUrl(absPath) {
  const p = absPath.replace(/\\/g, "/");
  if (!p.startsWith("/")) return "file:///" + p;
  return "file://" + p;
}

const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const onlySuffix = onlyArg ? onlyArg.slice("--only=".length).trim() : null;

const allJobs = [
  {
    html: path.join(root, "docs", "Goodland-Cloud-Architecture-Pricing.html"),
    pdf: path.join(root, "docs", "Goodland-Cloud-Architecture-Pricing.pdf"),
    margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" },
  },
  {
    html: path.join(root, "docs", "Goodland-Cloud-One-Pager.html"),
    pdf: path.join(root, "docs", "Goodland-Cloud-One-Pager.pdf"),
    margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
  },
  {
    html: path.join(root, "docs", "Goodland-Cloud-Technical-Overview-Support.html"),
    pdf: path.join(root, "docs", "Goodland-Cloud-Technical-Overview-Support.pdf"),
    margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" },
  },
];

const jobs = onlySuffix
  ? allJobs.filter((j) => j.html.replace(/\\/g, "/").endsWith(onlySuffix) || j.html.includes(onlySuffix))
  : allJobs;

if (onlySuffix && jobs.length === 0) {
  console.error("No job matched --only=", onlySuffix);
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const job of jobs) {
    const page = await browser.newPage();
    const fileUrl = toFileUrl(job.html);
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });
    await page.pdf({
      path: job.pdf,
      format: "A4",
      printBackground: true,
      margin: job.margin,
    });
    await page.close();
    console.log("Wrote", job.pdf);
  }
} finally {
  await browser.close();
}
