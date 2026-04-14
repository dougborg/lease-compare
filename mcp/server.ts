import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  calculateLease,
  compareLeases,
  getDefaultScenario,
  scenarioSchema,
} from "./tools.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let widgetTemplate: string | null = null;
try {
  widgetTemplate = readFileSync(
    join(__dirname, "ui", "lease-widget.html"),
    "utf-8",
  );
} catch {
  // Widget unavailable — text fallback only
}

const server = new McpServer({
  name: "lease-compare",
  version: "0.1.0",
});

server.tool(
  "calculate_lease",
  "Calculate all lease financials for a single dealer quote. Returns payment breakdown, money factor, implied APR, true cost, depreciation shield, and mileage overage analysis.",
  scenarioSchema,
  { readOnlyHint: true, idempotentHint: true },
  async (args) => {
    const result = calculateLease(args);
    return {
      content: [
        {
          type: "text" as const,
          text: `## ${result.name}\n\n${result.summary}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
);

server.tool(
  "compare_leases",
  "Compare 2-4 lease quotes side by side. Returns per-scenario breakdowns, rankings by effective monthly cost, and a recommendation for the best value.",
  {
    scenarios: z
      .array(z.object(scenarioSchema))
      .min(2)
      .max(4)
      .describe("Array of 2-4 lease scenarios to compare"),
  },
  { readOnlyHint: true, idempotentHint: true },
  async (args) => {
    const result = compareLeases(args.scenarios);

    const textParts = [
      "## Lease Comparison\n",
      ...result.scenarios.map((s) => `### ${s.name}\n${s.summary}\n`),
      "---",
      `**Recommendation:** ${result.recommendation}`,
      "",
      "**Ranking by effective monthly cost:**",
      ...result.comparison.ranking.map(
        (r, i) =>
          `${i + 1}. ${r.name}: ${r.formatted}/mo ${r.deltaFromBest === 0 ? "(best)" : `(${r.deltaFormatted})`}`,
      ),
    ];

    const content: Array<
      | { type: "text"; text: string }
      | {
          type: "resource";
          resource: { uri: string; mimeType: string; text: string };
        }
    > = [{ type: "text" as const, text: textParts.join("\n") }];

    if (widgetTemplate) {
      const dataScript = `<script>window.__LEASE_DATA__ = ${JSON.stringify(result)};</script>`;
      const fullHtml = widgetTemplate.replace(
        "</head>",
        `${dataScript}</head>`,
      );
      content.push({
        type: "resource" as const,
        resource: {
          uri: "ui://lease-compare/comparison",
          mimeType: "text/html",
          text: fullHtml,
        },
      });
    }

    return {
      content,
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
);

server.tool(
  "get_default_scenario",
  "Get the default scenario template with all available fields and their descriptions. Use this to understand what inputs are needed before building a lease calculation.",
  { readOnlyHint: true, idempotentHint: true },
  async () => {
    const result = getDefaultScenario();
    const lines = Object.entries(result.fieldDescriptions).map(
      ([field, desc]) => {
        const val = result.scenario[field as keyof typeof result.scenario];
        return `- **${field}**: ${desc} (default: ${val})`;
      },
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `## Lease Scenario Fields\n\n${lines.join("\n")}`,
        },
      ],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
