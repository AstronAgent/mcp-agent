import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
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

server.tool("sub", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
  content: [{ type: "text", text: String(a - b) }],
}));

// Add polymarket tool
server.tool(
  "get_polymarket_events",
  {
    limit: z.number().optional(),
    offset: z.number().optional(),
    order: z.string().optional(),
    ascending: z.boolean().optional(),
    id: z.array(z.number()).optional(),
    slug: z.array(z.string()).optional(),
    tag_id: z.number().optional(),
    exclude_tag_id: z.array(z.number()).optional(),
    related_tags: z.boolean().optional(),
    featured: z.boolean().optional(),
    cyom: z.boolean().optional(),
    include_chat: z.boolean().optional(),
    include_template: z.boolean().optional(),
    recurrence: z.string().optional(),
    closed: z.boolean().optional(),
    start_date_min: z.string().optional(),
    start_date_max: z.string().optional(),
    end_date_min: z.string().optional(),
    end_date_max: z.string().optional(),
  },
  async (params) => {
    try {
      const url = new URL("https://gamma-api.polymarket.com/events");
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error fetching Polymarket events` }],
      };
    }
  }
);

// Add a dynamic greeting resource
server.resource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
