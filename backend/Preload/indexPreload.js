const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

//get data from users.json
function getUsers() {
    try {
      const rawData = fs.readFileSync(path.join(__dirname, '../../backend/json/users.json'));
      let users = JSON.parse(rawData);
      return users.users;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  
  contextBridge.exposeInMainWorld('api', {
    getUsers: () => getUsers(),
  });


