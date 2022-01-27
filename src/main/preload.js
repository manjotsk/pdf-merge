const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
  doAction: async (arg) => {
    return ipcRenderer.invoke('an-action', arg);
  },
  saveFile: async (arg) => {
    return ipcRenderer.invoke('save-file', arg);
  },
  getDirectoryStructure: async (arg) => {
    return ipcRenderer.invoke('get-directory-structure', arg);
  },
  mergeFiles: async (arg) => {
    return ipcRenderer.invoke('merge-file', arg);
  },
  selectDirectory: async (arg) => {
    return ipcRenderer.invoke('select-directory', arg);
  },
});
