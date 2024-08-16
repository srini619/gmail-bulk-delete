const readline = require('node:readline');

/*
 * readline is for cmd line interaction to get usr inputs
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readLineAsync = msg => {
  return new Promise(resolve => {
    rl.question(msg, userRes => {
      resolve(userRes);
    });
  });
}

const getMailsPerLabel = async(labels,gmail) => {
    if (!labels || labels.length === 0) {
        console.log('No labels found.');
        return;
      }
    const labelsMailCount = labels.map(async obj => {
      console.log(obj.id,'obj.id')
        if (obj) {
            const labelDetails = await gmail.users.labels.get({
              userId: 'me',
              id: obj.id
            });
           return labelDetails.data
        }
      })
    return Promise.all(labelsMailCount)
}

/*
 * getMailsForInputLabel - gets the details of label given by user
 */
const getMailsForInputLabel = async(label,gmail) => {
  console.log('Getting details for label',label)
  // if (!labels || labels === null) {
  //     console.log('No labels found.');
  //     return;
  //   }
  //   const labelDetails = await gmail.users.labels.get({
  //     userId: 'me',
  //     id: label
  //   });

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `label:${label}`, // Query to filter emails from the specific sender
    });
    const messages = response.data.messages;
    // console.log(messages.map(msg => msg.id))
    console.log(`Email count for given label ${label}: ${messages?.length || 0}`)
    // return labelDetails.data
}


const listLabels = async(gmail) => {
  try {
    const res = await gmail.users.labels.list({
      userId: 'me',
    });
    const labels = res.data.labels;
    // console.log(res.data.messagesTotal,'messageTotal')
    if (!labels || labels.length === 0) {
      console.log('No labels found.');
      return;
    }
    console.log('Labels:');
    console.log(labels.map((obj) => obj.id))
   
    const labelUserRes = await readLineAsync('which label details do you want , enter the name as it is? ');
    console.log('Your response was: ' + labelUserRes + ' — Thanks!');
    const labelsOutput =  await getMailsForInputLabel(labelUserRes,gmail)
    //console.log(labelsOutput)
    rl.close();
  } catch (err) {
    console.error(`listLabels: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForIds - gets the count of emails from id given by user
 */
const listEmailCountForIds = async(gmail) => {
  try {
    const eid = await readLineAsync(`Enter the from email id: `);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${eid}`, // Query to filter emails from the specific sender
    });
    const messages = response.data.messages;
    console.log(`Email count from ${eid}: ${messages?.length || 0}`)
    rl.close();
  } catch(err) {
    console.error(`listEmailCountForIds: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForAttachments - gets the count of emails having attachment size greater than user input
 */
const listEmailCountForAttachments = async(gmail) => {
  try {
  console.log(`Get email count having attachments greater than input size`)
    const size = await readLineAsync(`Enter size in mb: `);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `has:attachment larger:${size}M`, // Query to filter emails from the specific sender
    });
    const messages = response.data.messages;
    console.log(`Email count having attachments greater than size ${size}mb: ${messages?.length || 0}`)
    rl.close();
  } catch(err) {
    console.error(`listEmailCountForAttachments: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForCustomQuery - gets the count of emails for the given custom query
 */
const listEmailCountForCustomQuery = async(gmail) => {
  try{
    const query = await readLineAsync(`Enter custom query: `);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `${query}`, // Query to filter emails from the specific sender
    });
    const messages = response.data.messages;
    // console.log(messages.map(msg => msg.id))
    console.log(`Email count for given query ${query}: ${messages?.length || 0}`)
    rl.close();
  } catch(err) {
    console.error(`listEmailCountForCustomQuery: error: ${err}`);
    throw err;
  }
} 

/*
 * getUserClassification - gets the type of filter from user and call the appropriate parent function
 */
const getUserClassification = async(gmail) => {
  console.log(`Welcome to Master Gmail cleanup application`)
  const getOrDeleteEmailUserRes = await readLineAsync(`1 for Get email count \n2 for Get email count and delete \nEnter a value `);

  const filterTypeUserRes = await readLineAsync(`\n${Number(getOrDeleteEmailUserRes) === 1 ? 'Get email count' : 'Get email count and delete'} \n 
 1 for Category-Label \n 2 for From-Email \n 3 for Attachment size \n 4 for Custom query \n Enter a value `);

  switch(Number(filterTypeUserRes)) {
    case 1:
      await listLabels(gmail)
      break;
    case 2:
      await listEmailCountForIds(gmail)
      break;
    case 3:
      await listEmailCountForAttachments(gmail)
      break;
    case 4 :
      await listEmailCountForCustomQuery(gmail)
      break;
    default: 
    console.log(`Enter a valid input`)
  }
}

module.exports = { getMailsPerLabel, listLabels, getUserClassification }
