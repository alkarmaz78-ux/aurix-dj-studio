const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#090a12",
    title: "AURIX DJ STUDIO",
    webPreferences: {
      preload: path.join(__dirname, "src", "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (!app.isPackaged) {
    win.loadURL("http://127.0.0.1:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

ipcMain.handle("audio:choose-files", async () => {
  const result = await dialog.showOpenDialog({
    title: "Добавить музыку",
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Audio", extensions: ["mp3", "wav", "flac", "m4a", "ogg", "aac"] }]
  });
  if (result.canceled) return [];
  return result.filePaths.map((filePath) => ({
    name: path.basename(filePath),
    path: filePath,
    url: require("node:url").pathToFileURL(filePath).href
  }));
});

ipcMain.handle("app:version", () => app.getVersion());

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});