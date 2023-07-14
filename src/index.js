const path = require('path');
const { publicDir } = require('./helper/path');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const smc = require('./smc');
const { Devices, CommandApdu } = require('./smartcard');

const PORT = process.env.SMC_AGENT_PORT || 3000;

if (app.env === 'production') {
  io.origins([`localhost:${PORT}`]);
}

if (app.env !== 'production') {
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'example.html'));
  });
}

io.on('connection', (socket) => {
  console.log(`New connection from ${socket.id}`);

  socket.on('set-query', (data = {}) => {
    const { query = undefined } = data;
    console.log(`set-query: ${query}`);
    smc.setQuery(query);
  });

  socket.on('set-all-query', (data = {}) => {
    smc.setAllQuery();
  });

  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
  // connect to smart card reader after server started.
  // delay because if restart by pm2, need to wait connection from client to set query
  setTimeout(async () => {
    // smc.init(io);
    let devices = new Devices();
    new Devices().on('device-activated', (event) => {
      // console.log(devices);
      console.log('event',event);
      // console.log('device-activated');
      // console.log(devices);
      const currentDevices = event.devices;
      // console.log(currentDevices);
      const device = event.device;
      // console.log(device);
      console.log(`Device '${device}' activated, devices: ${currentDevices}`);
      for (const prop in currentDevices) {
        console.log(`Devices: ${currentDevices[prop]}`);
      }

      device.on('card-inserted', async (event) => {
        const card = event.card;
        const message = `Card '${card.getAtr()}' inserted into '${event.device}'`;
        io.emit('smc-inserted', {
          status: 202,
          description: 'Card Inserted',
          data: {
            message,
          },
        });
        console.log(message);

        card.on('command-issued', (event) => {
          console.log(`Command '${event.command}' issued to '${event.card}' `);
        });

        card.on('response-received', (event) => {
          console.log(
            `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
          );
        });

        try {
          data = await read(card);
          if (DEBUG) console.log('Received data', data);
          io.emit('smc-data', {
            status: 200,
            description: 'Success',
            data,
          });
        } catch (ex) {
          const message = `Exception: ${ex.message}`;
          console.error(ex);
          io.emit('smc-error', {
            status: 500,
            description: 'Error',
            data: {
              message,
            },
          });
          if (EXIST_WHEN_READ_ERROR) {
            process.exit(); // auto restart handle by pm2
          }
        }
      });
      device.on('card-removed', (event) => {
        const message = `Card removed from '${event.name}'`;
        console.log(message);
        io.emit('smc-removed', {
          status: 205,
          description: 'Card Removed',
          data: {
            message,
          },
        });
      });

      device.on('error', (event) => {
        const message = `Incorrect card input'`;
        console.log(message);
        io.emit('smc-incorrect', {
          status: 400,
          description: 'Incorrect card input',
          data: {
            message,
          },
        });
      });
    });

    devices.on('device-deactivated', (event) => {
      const message = `Device '${event.device}' deactivated, devices: [${event.devices}]`;
      console.error(message);
      io.emit('smc-error', {
        status: 404,
        description: 'Not Found Smartcard Device',
        data: {
          message,
        },
      });
    });

    devices.on('error', (error) => {
      const message = `${error.error}`;
      console.error(message);
      io.emit('smc-error', {
        status: 404,
        description: 'Not Found Smartcard Device',
        data: {
          message,
        },
      });
    });
  }, 1500);
});
