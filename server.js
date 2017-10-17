const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const service = require('feathers-sequelize');
const path = require('path');
const handler = require('feathers-errors/handler');

const sequelize = new Sequelize('sequelize', '', '', {
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false
});

const Message = sequelize.define('message', {
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  label: {
    type: Sequelize.ENUM('UNLABELED','SPAM','NOSPAM'),
    allowNull: false,
    defaultValue: 'UNLABELED'
  }

});

function services() {
  this.use('/api/messages', service({
    Model: Message
  }));

}

const app = feathers();
app.configure(rest());
app.configure(socketio());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(feathers.static(path.join(__dirname, 'build')));

app.configure(services);
app.use(handler);

Message.sync({ force: true }).then(() => {
  app.service('/api/messages').create({
    text: 'Server started.',
    label: 'NOSPAM'
  }).then(message => {
    console.log('Created message.');
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log('starting API server ..');
});
