
const electron = require('electron');
const path = require('path');

// Menu generated for the purposes of visiting new URLs.
const { app, BrowserWindow, Menu} = electron;
// Prompting system to get user URL
const prompt = require('electron-prompt'); 

// Load the right flash plugin depending on the operating system.
let pluginName;
switch (process.platform) {
	case 'win32':
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flashver/pepflashplayer32.dll'
				console.log("ran!");
				break
			case 'x64':
				pluginName = 'flashver/pepflashplayer64.dll'
				console.log("ran!");
				break
		}
		break
	case 'linux':
		switch (process.arch) {
			case 'ia32':
			case 'x32':
				pluginName = 'flashver/libpepflashplayer.so'
				break
			case 'x64':
				pluginName = 'flashver/libpepflashplayer.so'
				break
		}

		app.commandLine.appendSwitch('no-sandbox');
		break
	case 'darwin':
		pluginName = 'flashver/PepperFlashPlayer.plugin'
		break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

// CACHE IS ENABLED but restarted on launch!
// TODO: Support importing custom .swf files to play

function promptIt(isSplash, win) { 
	// Handle prompting.
	prompt({
		title: "Flash Browser",
		label: "URL: ",
		inputAttrs: {
			type: 'url'
		},
		type: 'input'
	})
		.then((r) => {
			if (r == null) {
				console.log("user cancelled!");
				if (!isSplash) {
					app.quit();
				}
			} else {
				console.log('result', r);
				if (isSplash) {
					win.loadURL(r);
				}
				else {
					win.loadURL(r);
					win.maximize();
					setTimeout(() => {
						// Pauses program for 1 second to allow web-page to load before rendering.
						win.show(); 
					}, 1000);
                }

			}
		}).catch(console.error)
}


app.on('ready', function () {
	var menu = Menu.buildFromTemplate([
		{
			label: 'Menu',
			submenu: [
				{
					label: 'Change URL',
					click() {
						promptIt(true, win);
                    }
				},
				{
					label: 'Exit',
					click() {
						app.quit();
                    }
				}
			]
		}
	])
	Menu.setApplicationMenu(menu);
	
	let win = new BrowserWindow({
		show: false,
		webPreferences: {
			plugins: true
		}
	})
	promptIt(false, win);
	win.webContents.session.clearCache(function () {
		// TODO: clearCache
	});
	
})

// Handle quitting
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
})
