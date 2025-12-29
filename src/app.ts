import "dotenv/config";
import Fastify from "fastify";
import { chromium } from "playwright";
import { env } from "./env";

const fastify = Fastify();

fastify.get("/cv.pdf", async (_, reply) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  if (!env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL is not set");
  }

  await page.goto(`${env.FRONTEND_URL}/pdf`, {
    waitUntil: "networkidle",
  });

  await page.evaluateHandle("document.fonts.ready");

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: false,
    margin: {
      top: "0mm",
      bottom: "0mm",
      left: "0mm",
      right: "0mm",
    },
  });

  await browser.close();

  const filename = `CV_Rozghon_Fullstack-Developer.pdf`;

  reply
    .header("Content-Type", "application/pdf")
    .header("Cache-Control", "no-store")
    .header("Pragma", "no-cache")
    .header("Content-Disposition", `attachment; filename="${filename}"`)
    .send(pdf);
});

fastify.listen({ port: env.PORT, host: "0.0.0.0" });
