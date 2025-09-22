import fs from "fs";
import path from "path";

const userFile = path.join(process.cwd(), "users.json");

function loadUsers() {
  if (!fs.existsSync(userFile)) {
    fs.writeFileSync(userFile, "{}");
  }
  const data = fs.readFileSync(userFile);
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(userFile, JSON.stringify(users, null, 2));
}

export function getUser(username) {
  const users = loadUsers();
  return users[username];
}

export function addUser(username, passwordHash) {
  const users = loadUsers();
  users[username] = { passwordHash };
  saveUsers(users);
}