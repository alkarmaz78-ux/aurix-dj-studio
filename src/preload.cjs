const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  chooseFiles: () => ipcRenderer.invoke("audio:choose-files"),
  version: () => ipcRenderer.invoke("app:version")
});