import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { error } from "console";
import { z } from 'zod';
import { dbOperations } from "./database.js";

// Create a Server
const server = new McpServer({
    name: "TODO",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    }
});

// Add tools
server.tool(
    "add-todo", 
    {
        text: z.string()
    },
    async ({text}) => {
        const todo = dbOperations.addTodo(text);
        return {
            content: [
                {
                    type: "text",
                    text: `${text} was added to our to-do with ID ${todo.id}`,
                }
            ]
        }
    }
);


server.tool("get-todo", {}, async () => {
    const todos = dbOperations.getTodos();
    if (todos.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: "No todos found",
                }
            ]
        }
    }
    const todoList = todos.map((todo) => `${todo.id} : ${todo.text}`).join("\n")
    return {
        content: [
            {
                type: "text",
                text: `You have ${todos.length} todos: \n${todoList}`,
            }
        ]
    }
});



server.tool("remove-todo", {
    id: z.number(),
}, async ({id}) => {
    const success = dbOperations.removeTodo(id);
    if (!success) {
        return {
            content: [
                {
                    type: "text",
                    text: `To do ${id} was not found`,
                }
            ]
        }
    }
    return {
        content: [
            {
                type: "text",
                text: `To do ${id} was removed`,
            }
        ]
    }
});

// Start Server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error)=> {
    console.log(error);
    process.exit(1);
}); 