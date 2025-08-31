# Polymarket MCP Server

A Model Context Protocol (MCP) server that provides tools to interact with the Polymarket API, including fetching events, and basic arithmetic operations.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AstronAgent/mcp-agent.git
   cd mcp-agent
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server
```bash
npm run start:server
```

### Testing with Client
```bash
npm run start:client
```

This will spawn the server and test the tools, including the Polymarket events fetch.

## Tools

- **add**: Adds two numbers. Arguments: `a` (number), `b` (number)
- **sub**: Subtracts two numbers. Arguments: `a` (number), `b` (number)
- **get_polymarket_events**: Fetches events from Polymarket API. Supports various query parameters like `limit`, `offset`, `order`, etc.

## Resources

- **greeting**: Dynamic greeting resource. URI: `greeting://{name}`

## Dependencies

- `@modelcontextprotocol/sdk`: ^1.12.1
- `puppeteer`: ^24.10.0 (for potential scraping features)
- TypeScript and Node.js types for development
