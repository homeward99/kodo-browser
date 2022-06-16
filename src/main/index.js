const fs = require("fs");
const os = require("os");
const path = require("path");
const electron = require("electron");
const {
  app,
  globalShortcut,
  dialog,
  Menu,
  ipcMain,
  BrowserWindow
} = electron;
const electronRemote = require('@electron/remote/main');
electronRemote.initialize();
const {
  fork
} = require("child_process");
const { UplogBuffer } = require("kodo-s3-adapter-sdk/dist/uplog");
const { UploadAction } = require("@common/ipc-actions/upload");

///*****************************************
let root = path.dirname(__dirname);

let uiRoot = path.join(root, 'renderer');
// if (process.env.NODE_ENV != "development") {
//   uiRoot = path.join(uiRoot, "app");
// }

const iconRoot = path.join(root, 'renderer', 'icons')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let winBlockedTid; // time interval for close
let forkedWorkers = new Map();
let uploadRunning = 0;

switch (process.platform) {
case "darwin":
  app.dock.setIcon(
    path.join(iconRoot, "icon.png")
  );
  break;
case "linux":
  break;
case "win32":
  break;
}

//singleton
app.requestSingleInstanceLock();
// Someone tried to run a second instance, we should focus our window.
app.on('second-instance', (evt, argv, cwd) => {
  if (win) {
    if (win.isMinimized()) {
      win.restore();
    }

    win.focus();

    app.quit();
  }
});
app.releaseSingleInstanceLock();

let createWindow = () => {
  let opt = {
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 600,
    title: "Kodo Browser",
    icon: path.join(iconRoot, "icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  };

  let confirmForWorkers = (e) => {
    const runningJobs = forkedWorkers.size -
        1 + // upload-worker
        uploadRunning; // upload running jobs;

    if (runningJobs <= 0) {
      return;
    }

    // always stop
    if (winBlockedTid) {
      clearInterval(winBlockedTid);
    }

    let confirmCb = (btn) => {
      if (process.platform == "darwin") {
        switch (btn) {
        case 0:
          btn = 2;
          break;

        case 1:
          // ignore
          break;

        case 2:
          btn = 0;
          break;

        default:
          btn = 1;
        }
      }

      switch (btn) {
      case 0:
        forkedWorkers.forEach((worker) => {
          worker.kill();
        });

        forkedWorkers = new Map();

        break;

      case 1:
        // cancel close
        e.preventDefault();

        break;

      case 2:
        // cancel close
        e.preventDefault();

        clearInterval(winBlockedTid);
        winBlockedTid = setInterval(() => {
          if (runningJobs > 0) {
            return;
          }

          clearInterval(winBlockedTid);

          win.close();
        }, 3000);

        break;

      default:
        // cancel close
        e.preventDefault();
      }
    };

    let btns = ["Force Quit", "Cancel", "Waiting for jobs"];
    if (process.platform == "darwin") {
      btns = btns.reverse();
    }

    // prevent if there still alive workers.
    confirmCb(dialog.showMessageBox({
      type: "warning",
      message: `There ${runningJobs > 1 ? "are" : "is"} still ${runningJobs} ${runningJobs > 1 ? "jobs" : "job"} in processing, are you sure to quit?`,
      buttons: btns
    }));
  };

  if (process.platform == "linux") {
    opt.icon = path.join(root, "src", "renderer", "icons", "icon.png");
  }

  // Create the browser window.   http://electron.atom.io/docs/api/browserwindow/
  win = new BrowserWindow(opt);
  win.setTitle(opt.title);
  win.setMenuBarVisibility(false);
  electronRemote.enable(win.webContents);

  // Emitted before window reload
  win.on("beforeunload", confirmForWorkers);

  let focused = true, shown = true;

  const registerOrUnregisterShortcutForDevTools = () => {
    if (process.env.NODE_ENV != "development") {
      const shortcut = 'CommandOrControl+Alt+I';
      if (shown && focused) {
        if (!globalShortcut.isRegistered(shortcut)) {
          globalShortcut.register(shortcut, () => {
            win.webContents.toggleDevTools();
          });
        }
      } else {
        if (globalShortcut.isRegistered(shortcut)) {
          globalShortcut.unregister(shortcut);
        }
      }
    }
  };

  win.on("blur", function() {
    focused = false;
    registerOrUnregisterShortcutForDevTools();
  });
  win.on("focus", function() {
    focused = true;
    registerOrUnregisterShortcutForDevTools();
  });
  win.on("show", function() {
    shown = true;
    registerOrUnregisterShortcutForDevTools();
  });
  win.on("hide", function() {
    shown = false;
    registerOrUnregisterShortcutForDevTools();
  });
  win.on("close", confirmForWorkers);

  // Emitted when the window is closed.
  win.on("closed", (e) => {
    if (forkedWorkers.size > 0) {
      // force cleanup forked workers
      forkedWorkers.forEach((worker) => {
        worker.kill();
      });

      forkedWorkers = new Map();
    }

    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // load the index.html of the app.
  win.loadURL(`file://${uiRoot}/index.html`);

  if (process.env.NODE_ENV == "development") {
    console.log("run in development");

    // Open the DevTools.
    win.webContents.openDevTools();
  } else if (process.platform === "darwin") {
    console.log("run on macos in production");
    // Create the Application's main menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuTemplate()));
  }
};

///*****************************************
// listener events send from renderer process
ipcMain.on("UploaderManager", (event, message) => {
  const processName = "UploaderProcess";
  let uploaderProcess = forkedWorkers.get(processName);
  if (!uploaderProcess) {
    uploaderProcess = fork(
        path.join(root, "main", "uploader-bundle.js"),
        // is there a better way to pass parameters?
        ['--config-json', JSON.stringify({resumeUpload: true, maxConcurrency: 5})],
        {
          cwd: root,
          silent: false,
        },
    );
    forkedWorkers.set(processName, uploaderProcess);

    uploaderProcess.on("exit", () => {
      forkedWorkers.delete(processName)
    });

    uploaderProcess.on("message", (message) => {
      if (win && !win.isDestroyed()) {
        event.sender.send("UploaderManager-reply", message);
      }
      switch (message.action) {
        case UploadAction.UpdateUiData: {
          uploadRunning = message.data.running;
          break;
        }
      }
    });
  }

  uploaderProcess.send(message);
});

ipcMain.on("asynchronous", (event, data) => {
  switch (data.key) {
  case "getStaticServerPort":
    event.sender.send("asynchronous-reply", {
      key: data.key,
      port: serverPort
    });
    break;

  case "openDevTools":
    win.webContents.openDevTools();
    break;

  case "reloadWindow":
    win.webContents.reload();
    break;

  case "clearCache":
    win.webContents.session.clearCache(() => {
      console.info('cache cleared');
    });
    break;
  }
});

ipcMain.on("asynchronous-job", (event, data) => {
  switch (data.key) {
  case "job-upload":
    var forkOptions = {
      cwd: root,
      stdio: [0, 1, 2, 'ipc'],
      silent: true
    };

    var execScript = path.join(root, 'main', 'upload-worker-bundle.js');

    if (data.params.isDebug) {
      event.sender.send(data.job, {
        job: data.job,
        key: 'debug',
        env: {
          fork: forkOptions,
          script: execScript
        },
        data: data
      });
    }

    var worker = fork(execScript, [], forkOptions);
    forkedWorkers.set(data.job, worker);

    worker.send({
      key: 'start',
      data: data
    });

    worker.on('message', function (msg) {
      if (!win) return;

      if (data.params.isDebug) {
        event.sender.send(data.job, {
          job: data.job,
          key: 'debug',
          message: msg
        });
      }

      switch (msg.key) {
      case 'fileDuplicated':
        event.sender.send(data.job, {
          job: data.job,
          key: 'fileDuplicated',
        });

        break;

      case 'fileStat':
        event.sender.send(data.job, {
          job: data.job,
          key: 'fileStat',
          data: {
            progressLoaded: 0,
            progressTotal: msg.data.progressTotal,
            progressResumable: msg.data.progressResumable
          }
        });

        break;

      case 'progress':
        event.sender.send(data.job, {
          job: data.job,
          key: 'progress',
          data: {
            progressLoaded: msg.data.progressLoaded,
            progressTotal: msg.data.progressTotal,
            progressResumable: msg.data.progressResumable
          }
        });

        break;

      case 'filePartUploaded':
        event.sender.send(data.job, {
          job: data.job,
          key: 'filePartUploaded',
          data: msg.data
        });

        break;

      case 'fileUploaded':
        event.sender.send(data.job, {
          job: data.job,
          key: 'fileUploaded',
          data: msg.data
        });

        forkedWorkers.delete(data.job);
        setTimeout(() => { worker.kill(); }, 2000);

        break;

      case 'error':
        event.sender.send(data.job, {
          job: data.job,
          key: 'error',
          error: msg.error,
          stack: msg.stack
        });

        forkedWorkers.delete(data.job);
        setTimeout(() => { worker.kill(); }, 2000);

        break;

      case 'env':
        // ignore
        break;

      case 'debug':
        console.info({upload_debug: msg});
        event.sender.send(data.job, {
          job: data.job,
          key: 'debug',
          data: msg.data
        });
        break;

      default:
        event.sender.send(data.job, {
          job: data.job,
          key: 'unknown',
          message: msg
        });
      }
    });
    worker.on("exit", function (code, signal) {
      forkedWorkers.delete(data.job);

      if (!win) return;

      event.sender.send(data.job, {
        job: data.job,
        key: 'debug',
        exit: {
          code: code,
          signal: signal
        }
      });
    });
    worker.on("error", function (err) {
      forkedWorkers.delete(data.job);

      if (!win) return;

      event.sender.send(data.job, {
        job: data.job,
        key: 'error',
        error: err.message,
        stack: err.stack.split("\n")
      });
    });

    break;

  case "job-download":
    var forkOptions = {
      cwd: root,
      stdio: [0, 1, 2, 'ipc'],
      silent: true
    };

    var execScript = path.join(root, 'main', 'download-worker-bundle.js');

    if (data.params.isDebug) {
      event.sender.send(data.job, {
        job: data.job,
        key: 'debug',
        env: {
          fork: forkOptions,
          script: execScript
        }
      });
    }

    var worker = fork(execScript, [], forkOptions);
    forkedWorkers.set(data.job, worker);

    worker.send({
      key: "start",
      data: data
    });

    worker.on("message", function (msg) {
      if (!win) return;

      if (data.params.isDebug) {
        event.sender.send(data.job, {
          job: data.job,
          key: 'debug',
          message: msg
        });
      }

      switch (msg.key) {
      case 'fileStat':
        event.sender.send(data.job, {
          job: data.job,
          key: 'fileStat',
          data: {
            progressLoaded: 0,
            progressTotal: msg.data.progressTotal,
            progressResumable: msg.data.progressResumable
          }
        });

        break;

      case 'progress':
        event.sender.send(data.job, {
          job: data.job,
          key: 'progress',
          data: {
            progressLoaded: msg.data.progressLoaded,
            progressTotal: msg.data.progressTotal,
            progressResumable: msg.data.progressResumable
          }
        });

        break;

      case 'filePartDownloaded':
        event.sender.send(data.job, {
          job: data.job,
          key: 'filePartDownloaded',
          data: msg.data
        });

        break;

      case 'fileDownloaded':
        event.sender.send(data.job, {
          job: data.job,
          key: 'fileDownloaded',
          data: msg.data
        });

        forkedWorkers.delete(data.job);
        setTimeout(() => { worker.kill(); }, 2000);

        break;

      case 'error':
        event.sender.send(data.job, {
          job: data.job,
          key: 'error',
          error: msg.error,
          stack: msg.stack
        });

        forkedWorkers.delete(data.job);
        setTimeout(() => { worker.kill(); }, 2000);

        break;

      case 'env':
        // ignore
        break;

      case 'debug':
        console.info({download_debug: msg});
        event.sender.send(data.job, {
          job: data.job,
          key: 'debug',
          data: msg.data
        });
        break;

      default:
        event.sender.send(data.job, {
          job: data.job,
          key: 'unknown',
          message: msg
        });
      }
    });
    worker.on("exit", function (code, signal) {
      forkedWorkers.delete(data.job);

      if (!win) return;

      event.sender.send(data.job, {
        job: data.job,
        key: 'debug',
        exit: {
          code: code,
          signal: signal
        }
      });
    });
    worker.on("error", function (err) {
      forkedWorkers.delete(data.job);

      if (!win) return;

      event.sender.send(data.job, {
        job: data.job,
        key: 'error',
        error: err.message,
        stack: err.stack.split("\n")
      });
    });

    break;

  case "job-stop":
    var worker = forkedWorkers.get(data.job);
    if (worker) {
      worker.send({
        key: "stop"
      });
    }

    break;

  case "job-stopall":
    forkedWorkers.forEach((worker) => {
      worker.send({
        key: "stop"
      });
      setTimeout(() => { worker.kill(); }, 1000);
    });

    forkedWorkers = new Map();

    break;

  default:
    event.sender.send(data.job, {
      job: data.job,
      key: 'unknown',
      data: data
    });
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // prevent Uplog always locked
  // due to forcing quiting app when locked
  UplogBuffer.forceUnlock()
      .catch(err => {
        console.warn("unlock file failed:", err);
      });
  createWindow();
});

app.on("activate", () => {
  // On OS X it's common to recreate a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {

  // resolve inflight jobs persisted status not correct
  setTimeout(() => {
    app.quit();
  }, 3000);
  //}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function getMenuTemplate() {
  return [{
      label: "Application",
      submenu: [{
          label: "About Application",
          selector: "orderFrontStandardAboutPanel:"
        },
        {
          type: "separator"
        },
        {
          label: "Quit",
          accelerator: "Command+Q",
          click: function () {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [{
          label: "Undo",
          accelerator: "CmdOrCtrl+Z",
          selector: "undo:"
        },
        {
          label: "Redo",
          accelerator: "Shift+CmdOrCtrl+Z",
          selector: "redo:"
        },
        {
          type: "separator"
        },
        {
          label: "Cut",
          accelerator: "CmdOrCtrl+X",
          selector: "cut:"
        },
        {
          label: "Copy",
          accelerator: "CmdOrCtrl+C",
          selector: "copy:"
        },
        {
          label: "Paste",
          accelerator: "CmdOrCtrl+V",
          selector: "paste:"
        },
        {
          label: "Select All",
          accelerator: "CmdOrCtrl+A",
          selector: "selectAll:"
        }
      ]
    },
    {
      label: "Window",
      submenu: [{
          label: "Minimize",
          accelerator: "CmdOrCtrl+M",
          click: function () {
            win.minimize();
          }
        },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+W",
          click: function () {
            win.close();
          }
        }
      ]
    }
  ];
}
