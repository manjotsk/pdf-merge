/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  globalShortcut,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';

import { PDFDocument } from 'pdf-lib';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const dirTree = require('directory-tree');
const Store = require('electron-store');

const store = new Store();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

async function mergePDFDocuments(arg: {
  files: any;
  saveAt: fs.PathOrFileDescriptor;
}) {
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < arg.files.length; i++) {
    const document = arg.files[i];
    const asas = fs.readFileSync(document);
    const filedoc = await PDFDocument.load(asas);

    const copiedPages = await mergedPdf.copyPages(
      filedoc,
      filedoc.getPageIndices()
    );

    copiedPages.forEach((page) => mergedPdf.addPage(page));
    // emit event to renderer
    mainWindow?.webContents.send('mergeProgress', i, arg.files.length);
  }
  const mergedPdfFile = await mergedPdf.save();

  fs.writeFileSync(arg.saveAt, mergedPdfFile);
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('an-action', async (event, arg) => {
  // do stuff
  //  awaitableProcess
  const a = await new Promise((resolve) =>
    setTimeout(() => {
      resolve('okokok');
    }, 1000)
  );
  return a;
});

const getAllFilesAndFoldersRecursively = () => {
  const files: string[] = [];
  const folders: string[] = [];
  const structure: any = {};

  const getAllFilesAndFoldersRecursivelyInner = (dir: string) => {
    const filesInDir = fs.readdirSync(dir);
    filesInDir.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFilesAndFoldersRecursivelyInner(filePath);
        folders.push(filePath);
      } else {
        files.push(filePath);
      }
    });
  };
  getAllFilesAndFoldersRecursivelyInner(app.getPath('appData'));
  return { files, folders };
};

ipcMain.handle('get-directory-structure', async (event, arg) => {
  const rootpath = store.get('root-path');
  if (!rootpath) {
    return null;
  }
  const appPath = path.join(rootpath);
  const a = dirTree(appPath, {
    extensions: /\.pdf$/,
  });
  console.log(a);

  return a;
});

ipcMain.handle('save-file', async (event, arg) => {
  // do stuff
  //  awaitableProcess
  try {
    const appData = app.getPath('appData');
    const appPath = path.join(appData, 'g6-pdf-merge', `${arg.key}`);
    // check if directory exists
    if (!fs.existsSync(appPath)) {
      fs.mkdirSync(appPath);
    }
    const name = path.join(appPath, arg.name);

    fs.copyFile(arg.path, name, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return name;
  } catch (error) {
    console.log(error);
  }
});

// select directory to save file
ipcMain.handle('select-directory', async (event, arg) => {
  const options = {
    properties: ['openDirectory'],
    filters: [
      {
        name: 'electron pdf',
        extensions: ['pdf'],
      },
    ],
  };
  const result = dialog.showSaveDialogSync(mainWindow, options);
  if (result) {
    return result;
  }
});

ipcMain.handle('setup-root-path', async (event, arg) => {
  const options = {
    properties: ['openDirectory'],
  };
  const result = dialog.showOpenDialogSync(mainWindow, options);
  if (result) {
    store.set('root-path', result[0]);
    return result[0];
  }
});

ipcMain.handle('get-root-path', async (event) => {
  return store.get('root-path');
});

ipcMain.handle('merge-file', async (event, arg) => {
  return mergePDFDocuments(arg).then(() => {
    shell.showItemInFolder(path.normalize(arg.saveAt));
    shell.beep();
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  globalShortcut.register('CommandOrControl+R', function () {
    console.log('CommandOrControl+R is pressed');
    mainWindow.reload();
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
