const { format } = require('date-fns');
const { v4: uuid } = require('uuid'); //can be imported in other ways

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const logEvents = async (message, logName) =>{
    const DateTime = `${format(new Date(), 'yyyy-MM-dd\tHH:mm:ss')}` //Time of event inside the template literal `$`
    const logItem = `${DateTime}\t${uuid()}\t${message}\n`; //Shows a unique ID for each log event
    console.log(logItem)

    try{
        if (!fs.existsSync(path.join(__dirname, 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, 'logs'));
        }
        //testing
        await fsPromises.appendFile(path.join(__dirname, 'logs', logName),logItem);
    } catch (err) {
        console.log(err);
    }
}

module.exports = logEvents;