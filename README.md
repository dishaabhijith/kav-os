

<h2 align="center">Overview</h2>
<p align="center">DIVYA-OS is a Linux emulator designed to simulate a Debian-based Linux environment. It supports basic commands typically found in such systems, allowing users to practice and familiarize themselves with terminal operations in a controlled, browser-based environment.</p>

<h2 align="center">Features</h2>
<ul>
  <li><strong>User Management:</strong> Add and switch between multiple local users.</li>
  <li><strong>System Update and Upgrade:</strong> Simulate the update and upgrade of repositories and packages.</li>
  <li><strong>File System Navigation:</strong> Navigate through directories, list storage contents, and print the working directory.</li>
  <li><strong>System Information:</strong> Display basic system information like the distro version.</li>
</ul>


<h4>Can be started using 'gui --start'</h4>

<h2 align="center">Supported Commands</h2>
<ul>
  <li><code>sudo su</code>: Access the root user.</li>
  <li><code>sudo apt update</code>: Update the repository index.</li>
  <li><code>sudo apt upgrade / sudo apt upgrade -y</code>: Upgrade installed packages.</li>
  <li><code>cd &lt;directory&gt;</code>: Change the current directory.</li>
  <li><code>ls</code>: List the contents of the current directory.</li>
  <li><code>pwd</code>: Print the current working directory.</li>
  <li><code>adduser &lt;username&gt;</code>: Add a new local user.</li>
  <li><code>login &lt;username&gt;</code>: Log into an existing local user.</li>
  <li><code>whoami</code>: Print the current username.</li>
  <li><code>exit</code>: Exit the root user session.</li>
  <li><code>uname -a</code>: Display the current version of the distribution.</li>
  <li><code>ifconfig</code>: Display information about your network.</li>
  <li><code>trace -m</code>: Get information about your own IP Address.</li>
  <li><code>trace -t &lt;ip addr&gt;</code>: Get information about the entered IP Address.</li>
</ul>

<h2 align="center">v.01 beta Update</h2>
<ul>
  <li><code>mkdir &lt;directory&gt;</code>: Create a new directory.</li>
  <li><code>rmdir &lt;directory&gt;</code>: Remove an empty directory.</li>
  <li><code>rm &lt;file&gt;</code>: Remove a file.</li>
  <li><code>rm -rf &lt;directory&gt;</code>: Remove a directory and its contents recursively.</li>
  <li><code>nano &lt;filename&gt;</code>: Create or edit a file.</li>
  <li><code>cat &lt;filename&gt;</code>: Display the content of a file.</li>
  <li><code>gui --start </code>: Start the Desktop environment.</li>
</ul>
<p><strong>Accessing or modifying root directories is prohibited.</strong></p>
<p><strong>The GUI is under development and some features might not work!</strong></p>
<p><strong>To exit the GUI simply refresh the webpage.</strong></p>
<p><em>More commands will be added soon...</em></p>


<h2 align="center">Issues & Fixes ⚒</h2>
<p><strong>ls: cannot access 'undefined': No such file or directory:</strong> This issue may arise if the cached data interferes with the new implementation of <em>LocalStorage</em> to store data locally in the browser.</p>
<p><strong>Fix:</strong> Clearing cookies and site data can fix this issue.</p>
<p><em>This issue will be fixed in the next update 🚀</em></p>
