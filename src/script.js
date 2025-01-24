let isRoot = false;
let pwd = JSON.parse(localStorage.getItem('pwd')) || { 'user': '12345' };
let currentUser = 'user';
let currentDir = '~';
let authenticated = false;
let promptElement = document.getElementById('prompt');
let outputElement = document.getElementById('output');
let inputElement = document.getElementById('input');

let filesystem;

const SUDO_PASSWORD = 'photon';
const SUDO_HINT = 'h𝜈';
const ROOT_DIRS = {
    '/': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'lib64', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'],
};

const HOME_DIR_NAMES = ['Documents', 'Downloads', 'Music', 'Pictures', 'Videos'];

function initializeFilesystem() {
    if (localStorage.getItem('filesystem')) {
        filesystem = JSON.parse(localStorage.getItem('filesystem'));
        return;
    }

    filesystem = {
        '/': ROOT_DIRS['/'],
        '/home': [],
    };

    for (let user in pwd) {
        if (user === 'root') {
            continue;
        }
        filesystem[`/home/${user}`] = HOME_DIR_NAMES;
        for (let dir in HOME_DIR_NAMES) {
            filesystem[`/home/${user}/${dir}`] = [];
        }
    }
    localStorage.setItem('filesystem', JSON.stringify(filesystem));
}

function getCurrentPath() {
    if (currentDir.startsWith('~'))
        return `/home/${currentUser}${currentDir.slice(1)}`;
    return currentDir;
}

function absolutePath(relativePath) {
    if (relativePath.startsWith('/')) {
        return relativePath;
    } else if (relativePath.startsWith('~')) {
        return `/home/${currentUser}${relativePath.slice(1)}`;
    } else {
        return `${getCurrentPath()}/${relativePath}`;
    }
}

function updatePrompt() {
    promptElement.textContent = `${currentUser}@divya-os:${currentDir}$ `;
    promptElement.style.color = isRoot ? 'red' : 'violet';
}

function lsOutputFormatted(dirToDisplay, contents) {
    return contents.map(item => {
        if (isDir(`${dirToDisplay}/${item}`)) {
            return `<span style="color:lightblue;">${item}</span>`;
        } else {
            return `<span style="color:pink;">${item}</span>`;
        }
    }).join(' ');
}

function isDir(path) {
    return path in filesystem && Array.isArray(filesystem[path]);
}

function isProtectedDir(path) {
    if (path === '/') {
        return false;
    }
    return !path.startsWith('/home');
}

async function executeCommand(command) {
    command = command.trim();
    if (!command) {
        return '';
    }

    let output = '';
    let argv = command.split(' ');
    let argc = argv.length;
    let cmd = argv[0];
    filesystem = JSON.parse(localStorage.getItem('filesystem'));

    switch (cmd) {
        case 'sudo':
            if (argv[1] === 'su') {
                let password = prompt("Enter password for sudo: ");
                if (password !== SUDO_PASSWORD) {
                    return `Authentication failure. Hint: ${SUDO_HINT}`;
                }
                isRoot = true;
                authenticated = true;
                currentUser = 'root';
                currentDir = '/';
                return '';
            }
            else {
                return executeCommand(command.slice(4));
            }
        case 'ls':
            let dirToDisplay = argc > 1 ? absolutePath(argv[1]) : getCurrentPath();
            if (isProtectedDir(dirToDisplay)) {
                return `ls: cannot access '${argv[1]}': Permission denied`;
            } else if (filesystem[dirToDisplay]) {
                return lsOutputFormatted(dirToDisplay, filesystem[dirToDisplay]);
            } else {
                return `ls: cannot access '${argv[1]}': No such file or directory`;
            }
        case 'cd':
            if (argc == 1) {
                currentDir = '~';
                return 'Defaulting to home directory';
            }
            let newPath = absolutePath(argv[1]);
            if (isProtectedDir(newPath)) {
                return `bash: cd ${argv[1]}: Permission denied`;
            } else if (filesystem[newPath]) {
                currentDir = newPath.replace(`/home/${currentUser}`, '~');
                return '';
            } else {
                return `bash: cd ${argv[1]}: No such file or directory`;
            }
        case 'pwd':
            return getCurrentPath();
        case 'whoami':
            return currentUser;
        case 'uname':
            if (argv[1] === '-a') {
                return 'Electron v1.1.3 (beta)';
            } else {
                return 'Usage: uname -a';
            }
        case 'python':
            if (argv[1] === '--version') {
                return 'Python 3.12.3';
            } else {
                return 'Usage: python --version';
            }
        case 'adduser':
            if (argc !== 2) {
                return 'Usage: adduser username';
            }
            let newUser = argv[1];
            let password1 = prompt('Set a new password: ');
            let password2 = prompt('Enter the password again: ');
            if (password1 !== password2) {
                return 'Passwords do not match. Try again.';
            }
            pwd[newUser] = password1;
            filesystem[`/home/${newUser}`] = HOME_DIR_NAMES;
            HOME_DIR_NAMES.forEach(dir => {
                filesystem[`/home/${newUser}/${dir}`] = [];
            });
            localStorage.setItem('pwd', JSON.stringify(pwd));
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            return `Added user ${newUser}.`;
        case 'login':
            if (argc !== 2) {
                return "Usage: login username";
            }
            let user = argv[1];
            let password = prompt(`Password: `);
            if (pwd[user] !== password) {
                return 'Login incorrect';
            }
            currentUser = user;
            currentDir = '~';
            return `Logged in as ${user}`;
        case 'exit':
            if (!isRoot) {
                return 'No more processes left to exit.';
            }
            isRoot = false;
            authenticated = false;
            currentUser = 'user';
            currentDir = '~';
            break;
        case 'clear':
            outputElement.innerHTML = '';
            return '';
        case 'nano':
            if (argc != 2) {
                return 'Usage: nano filename';
            }
            let fileName = argv[1];
            let filePath = absolutePath(fileName);
            let content = filesystem[filePath] || '';
            content = prompt('Enter file content: ', content);
            filesystem[filePath] = content;
            let dir = filePath.substring(0, filePath.lastIndexOf('/'));
            if (filesystem[dir].includes(fileName)) {
                output = `Modified file ${fileName}.`;
            } else {
                filesystem[dir].push(fileName);
                output = `Created file ${fileName}.`;
            }
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            return output;
        case 'cat':
            if (argc != 2) {
                return 'Usage: cat filename';
            }
            let fileToRead = absolutePath(argv[1]);
            if (isProtectedDir(fileToRead)) {
                return `cat: ${argv[1]}: Permission denied`;
            } else if (fileToRead in filesystem) {
                return filesystem[fileToRead];
            } else {
                return `cat: ${argv[1]}: No such file or directory`;
            }
        case 'mkdir':
            if (argc != 2) {
                return 'Usage: mkdir directory';
            }
            let dirName = argv[1];
            let dirPath = absolutePath(dirName);
            let parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
            if (filesystem[parentDir].includes(dirName)) {
                return `mkdir: failed to create directory '${dirName}': Already exists.`;
            }
            filesystem[dirPath] = [];
            filesystem[parentDir].push(dirName);
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            return `Created directory ${dirName}.`;
        case 'rmdir':
            if (argc != 2) {
                return 'Usage: rmdir directory';
            }
            dirName = argv[1];
            dirPath = absolutePath(dirName);
            if (isProtectedDir(dirPath)) {
                return `rmdir: failed to remove '${dirName}': Permission denied`;
            } else if (!isDir(dirPath)) {
                return `rmdir: failed to remove '${dirName}': Not a directory`;
            } else if (!(dirPath in filesystem)) {
                return `rmdir: failed to remove '${dirName}': Directory does not exist.`;
            } else if (filesystem[dirPath].length !== 0) {
                return `rmdir: failed to remove '${dirName}': Directory is not empty.`;
            }
            delete filesystem[dirPath];
            parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
            filesystem[parentDir] = filesystem[parentDir].filter(dir => dir !== dirName);
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            return `Removed directory ${dirName}.`;
        case 'rm':
            if (argc != 2 && argc !== 3
                    || argc === 3 && !(argv[1] in ['-f', '-r', '-rf'])) {
                return 'Usage: rm [-rf] filename';
            }
            let recursive = argc === 3 && argv[1].includes('r');
            fileName = argv[argc - 1];
            let targetPath = absolutePath(fileName);
            if (isProtectedDir(targetPath)) {
                return `rm: cannot remove '${fileName}': Permission denied`;
            }
            if (!(targetPath in filesystem)) {
                return `rm: cannot remove '${fileName}': No such file or directory`;
            }
            if (isDir(targetPath) && !recursive) {
                return `rm: cannot remove '${fileName}': Is a directory.\nDid you mean to use "rm -r ${fileName}"?`;
            }
            if (recursive) {
                function deleteRecursively(path) {
                    if (Array.isArray(filesystem[path])) {
                        filesystem[path].forEach(item => deleteRecursively(`${path}/${item}`));
                    }
                    delete filesystem[path];
                }
                deleteRecursively(targetPath);
            }
            parentDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
            filesystem[parentDir] = filesystem[parentDir].filter(item => item !== fileName);
            localStorage.setItem('filesystem', JSON.stringify(filesystem));
            return `Removed ${fileName}`;
        case 'trace':
            if (argv[1] === '-m') {
                return await fetchIpInfo();
            } else if (argv[1] === '-t' && argv[2]) {
                const targetIp = argv[2];
                return await fetchIpInfo(targetIp);
            } else {
                return 'Usage: trace -m | trace -t (IP address)';
            }
        case 'gui':
            if (argv[1] === '--start') {
                // Add the necessary CSS styles for the blur effect and transition
                const style = document.createElement('style');
                style.innerHTML = `
                    .blurred {
                        filter: blur(10px);
                        transition: filter 0.5s ease;
                    }
                `;
                document.head.appendChild(style);

                // Apply the blur effect to the body
                // document.body.classList.add('blurred');

                // Create the iframe and set its properties
                const iframe = document.createElement('iframe');
                iframe.src = 'assets/GUI/index.html';
                iframe.style.width = '100vw';
                iframe.style.height = '100vh';
                iframe.style.border = 'none';

                // Add an event listener to remove the blur effect once the iframe loads
                // iframe.onload = () => {
                //     document.body.classList.remove('blurred');
                // };

                // Clear the body content and append the iframe
                setTimeout(() => {
                    document.body.innerHTML = '';
                    document.body.appendChild(iframe);
                }, 500); // Wait for the transition to complete

                return 'GUI started.';
            } else if (argv[1] === '--kill') {
                location.reload();
                return 'GUI killed.';
            } else {
                return 'Usage: gui --start | gui --kill';
            }
        default:
            return `Command not found: ${command}`;
    }
    return "ERROR: function executeCommand did not return an output";
}

async function fetchIpInfo(ip = '') {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    const { ip: ipAddress, city, region, country_name, timezone, org, asn, latitude, longitude, utc_offset } = data;
    const localTime = new Date().toLocaleString('en-US', { timeZone: timezone });

    return `IP: ${ipAddress}
City: ${city}
Region: ${region}
Country: ${country_name}
Timezone: ${timezone}
Local Time: ${localTime}
ISP: ${org}
ASN: ${asn}
Latitude: ${latitude}
Longitude: ${longitude}`;
}

inputElement.addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') {
        let command = inputElement.value;
        let output = await executeCommand(command);
        if (output) {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div><div style="color:lime; text-align:left;">${output}</div>`;
        } else {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div>`;
        }
        inputElement.value = '';
        updatePrompt();
        outputElement.scrollTop = outputElement.scrollHeight;
    }
});

initializeFilesystem();
updatePrompt();
