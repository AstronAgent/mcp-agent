import { McpServer, ResourceTemplate, } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
// Create an MCP server
const server = new McpServer({
    name: "Demo",
    version: "1.0.0",
});
// Add an addition tool
server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
}));
// Add screenshot tool
server.tool("take_coinglass_screenshots", {
    outputDir: z
        .string()
        .optional()
        .describe("Output directory for screenshots (default: current directory)"),
    headless: z
        .boolean()
        .optional()
        .describe("Run browser in headless mode (default: false)"),
}, async ({ outputDir = ".", headless = false }) => {
    const endpoints = [
        {
            url: "https://www.coinglass.com/pro/heatmap/market-cap",
            folder: "marketcap",
        },
        {
            url: "https://www.coinglass.com/pro/heatmap/fundingrate",
            folder: "fundingrate",
        },
        { url: "https://www.coinglass.com/pro/heatmap/rsi", folder: "rsi" },
        {
            url: "https://www.coinglass.com/pro/heatmap/price-change",
            folder: "price-change",
        },
        { url: "https://www.coinglass.com/pro/heatmap/oi", folder: "oi" },
        {
            url: "https://www.coinglass.com/pro/heatmap/oi-change",
            folder: "oi-change",
        },
        {
            url: "https://www.coinglass.com/pro/heatmap/oi-change-usd",
            folder: "oi-change-usd",
        },
        { url: "https://www.coinglass.com/pro/heatmap/vol", folder: "vol" },
        {
            url: "https://www.coinglass.com/pro/heatmap/vol-change",
            folder: "vol-change",
        },
        {
            url: "https://www.coinglass.com/pro/heatmap/vol-change-usd",
            folder: "vol-change-usd",
        },
    ];
    try {
        // Launch the browser and open a new blank page
        const browser = await puppeteer.launch({
            headless: headless, // Show the browser UI
            slowMo: 100, // Slow down operations by 100ms
            args: ["--start-maximized"],
            // devtools: true, // Open DevTools automatically (optional)
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        // Generate timestamp for all filenames
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, "-")
            .slice(0, 19);
        const results = [];
        // Process each endpoint
        for (const endpoint of endpoints) {
            try {
                console.log(`Processing ${endpoint.folder}...`);
                // Navigate to the URL
                await page.goto(endpoint.url);
                // Create directory if it doesn't exist (in outputDir)
                const folderPath = path.join(outputDir, endpoint.folder);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }
                // Wait for the button and click it
                const buttonSelector = "#cg-treemap > div.MuiBox-root.cg-style-1us6v5o > div.MuiStack-root.cg-style-1mzerio > button.MuiIconButton-root.MuiIconButton-variantOutlined.MuiIconButton-colorNeutral.MuiIconButton-sizeMd.cg-style-128wg0v";
                await page.waitForSelector(buttonSelector, { timeout: 10000 });
                await page.click(buttonSelector);
                console.log(`Button clicked successfully for ${endpoint.folder}`);
                // Wait for content to load
                // await page.waitForTimeout(2000);
                // Generate filename
                const filename = path.join(folderPath, `${endpoint.folder}-heatmap-${timestamp}.png`);
                // Take a screenshot of full page
                await page.screenshot({ path: filename, fullPage: true });
                console.log(`Screenshot saved as ${filename}`);
                results.push(`✓ ${endpoint.folder}: ${filename}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Error processing ${endpoint.folder}:`, errorMessage);
                results.push(`✗ ${endpoint.folder}: Error - ${errorMessage}`);
            }
        }
        await browser.close();
        console.log("All screenshots completed!");
        return {
            content: [
                {
                    type: "text",
                    text: `All screenshots completed!\n\n${results.join("\n")}\n\nTotal processed: ${endpoints.length} endpoints`,
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error taking screenshots: ${errorMessage}`,
                },
            ],
        };
    }
});
// Add a dynamic greeting resource
server.resource("greeting", new ResourceTemplate("greeting://{name}", { list: undefined }), async (uri, { name }) => ({
    contents: [
        {
            uri: uri.href,
            text: `Hello, ${name}!`,
        },
    ],
}));
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
