const http = require('http'),
    fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
module.exports.getIndex = async function getIndex(req, res) {
    await fs.readFile('./index.html', function (err, html) {
        res.writeHeader(200, {"Content-Type": "text/html"});  
        res.write(html);  
        res.end();  
    });
}

function encrypt(text, password) {
    const cipher = crypto.createCipher('aes-256-ctr', password);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }
  
  function decrypt(text, password) {
    const decipher = crypto.createDecipher('aes-256-ctr', password);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

module.exports.getCallback = async function getCallback(req, res) {
    const data = { textarea: null };
    if (req.body.textarea) {
        await writeFile(`./files/${req.body.username}`, encrypt(req.body.textarea, req.body.password));
        res.write("saved a thingy").end()
      } else {
        try {
          data.textarea = decrypt(await readFile(`./files/${req.body.username}`, { encoding: 'utf8' }), req.body.password);
        } catch (err) {
          if (err.code === 'ENOENT') {
            data.textarea = `No message for this user`;
          } else {
            throw err;
          }
        }
      res.json(data).end();
      }
}