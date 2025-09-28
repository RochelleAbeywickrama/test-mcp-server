import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";


export type Todo = {
    id: number;
    text: string;
}

const DB_LOCATION = "/Users/rochelle.abeywickrama/MCP/TODO/todos";
const dataDir = resolve(DB_LOCATION);

if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

// Initialize the database
const dbPath = join(dataDir, "todos.db")

// Connect to the database (creates it if it doesn't exist)
const db = new Database(dbPath);

// Create the todos table if it doesn't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
    )
`)

// Define the Todo type
export const dbOperations = {
    addTodo: (text: string) => {
        const stmt = db.prepare("INSERT INTO todos (text) VALUES (?)");
        const info = stmt.run(text);
        return {
            id: info.lastInsertRowid as number,
            text,       
        };
    },
    getTodos: () => {
        const stmt = db.prepare("SELECT * FROM todos ORDER BY id DESC");
        return stmt.all() as Todo[];
    },
    removeTodo: (id: number): boolean => {
        const stmt = db.prepare("DELETE FROM todos WHERE id = ?");
        const info = stmt.run(id);
        return info.changes > 0; // Returns true if the todo was deleted
    }
}