import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
async function createMcpClient() {
    // Create client transport that spawns the server
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/server.js"],
    });
    // Create and connect client
    const client = new Client({
        name: "demo-client",
        version: "1.0.0",
    }, {
        capabilities: {
            tools: {},
            resources: {},
        },
    });
    await client.connect(transport);
    return { client, transport };
}
async function main() {
    const { client, transport } = await createMcpClient();
    try {
        // Test the add tool
        console.log("Testing add tool...");
        const addResult = await client.callTool({
            name: "add",
            arguments: { a: 5, b: 3 },
        });
        console.log("Add result:", addResult);
        // Test the sub tool
        console.log("\nTesting sub tool...");
        const subResult = await client.callTool({
            name: "sub",
            arguments: { a: 5, b: 3 },
        });
        console.log("Sub result:", subResult);
        // Test polymarket tool
        console.log("\nTesting polymarket tool...");
        const polymarketResult = await client.callTool({
            name: "get_polymarket_events",
            arguments: { limit: 5 },
        });
        console.log("Polymarket result:", polymarketResult);
        // Test listing resources
        console.log("\nListing resources...");
        const resources = await client.listResources();
        console.log("Resources:", resources);
        // Test reading a greeting resource
        console.log("\nReading greeting resource...");
        const greetingResult = await client.readResource({
            uri: "greeting://Worldwar",
        });
        console.log("Greeting result:", greetingResult);
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        // Clean up
        await client.close();
    }
}
main().catch(console.error);
