# Thai Smartcard Reader with Node.js

Nodejs application read personal and nhso data from thai id card, it run in the background and wait until inserted card then send readed data to everyone via [socket.io](https://socket.io/).

## Other Version
- [Go](https://github.com/somprasongd/go-thai-smartcard)
- [Java](https://github.com/somprasongd/jThaiSmartCard)

## Installation

### Windows

- Install Nodejs with [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) (use node 14.15)
  ```bash
  nvm install 14.15
  nvm use 14.15
  ```
- Start PowerShell as Administrator and run: `npm install --global --production windows-build-tools`, or use option 2 in <https://github.com/nodejs/node-gyp#on-windows>
- Go to `thai-smartcard-nodejs` and run `npm install`
- Setup PM2
  ```bash
  npm install -g pm2 pm2-windows-startup
  pm2-startup install
  pm2 start src/index.js --name smc
  pm2 save
  ```

### Ubuntu & Pi

- Install [Python 2.7.x](https://www.python.org/downloads/)
- Run `$ sudo apt-get install libpcsclite1 libpcsclite-dev pcscd`
- Install Nodejs with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (use node 14.15)
  ```bash
  nvm install 14.15
  nvm use 14.15
  ```
- Go to `thai-smartcard-nodejs` and run `npm install`
- Setup PM2
  ```bash
  npm install -g pm2
  pm2 start src/index.js --name smc
  pm2 startup
  pm2 save
  ```

### Mac

- Install [Xcode Command-line Tools](https://developer.apple.com/download/more/?=command%20line%20tools)
- Install [Homebrew](https://brew.sh/)
- Install nvm

```bash
# 1. Install NVM
brew install nvm

# 2. Create a directory for NVM
mkdir ~/.nvm

# 3. add these lines to ~/.bash_profile ( or ~/.zshrc for macOS Catalina or later)
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

# 4. Reload Config
source ~/.bash_profile (or source ~/.zshrc)

# 5. Test
nvm -v
```

- Install Nodejs with [nvm]

```bash
nvm install 14.15
nvm use 14.15
```

- Go to `thai-smartcard-nodejs` and run `npm install`
- Setup PM2

```bash
npm install -g pm2
pm2 start src/index.js --name smc
pm2 startup
pm2 save
```

## Change Server Port

- Default port is `9898`, change by set system environment `SMC_AGENT_PORT`.

## Example

### Client connect with socket.io

```javascript
<script>
  const socket = io.connect('http://localhost:9898');
  socket.on('connect', function () {
    /**
    * Select field to read from smart card
    * Available fields: 'cid', 'name', 'nameEn', 'dob', 'gender', 'issuer', 'issueDate', 'expireDate', 'address', 'photo', 'nhso', 'laserId'
    */
    socket.emit('set-query', {
      query: ['cid', 'name']
    });

    // Or set select all fields.
    // socket.emit('set-all-query');
  });
  socket.on('smc-data', function (data) {
    console.log(data);
  });
  socket.on('smc-error', function (data) {
    console.log(data);
  });
  socket.on('smc-removed', function (data) {
    console.log(data);
  });
  socket.on('smc-deactivated', function (data) {
    console.log(data);
  });
  socket.on('smc-incorrect', function (data) {
      console.log(data);
  });
  socket.on('smc-inserted', function (data) {
    console.log(data);
  });
</script>
```

## Donate

สนับสนุนได้ผ่านทาง Promptpay

<img src="https://bit.ly/3gusiz8">
