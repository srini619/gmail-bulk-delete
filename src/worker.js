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

/*
 * deleteEmailsInBatch - deletes Email in Batches of 50 
 */
const deleteEmailsInBatch = async(gmail,messages) => {
    const messageIds = messages.map((message) => message.id);
    let count = 1
    while (messageIds.length > 0) {
      const batch = messageIds.splice(0, 50);
      await gmail.users.messages.batchDelete({
        userId: 'me',
        ids: batch,
      });
      console.log(`deleteEmailsInBatch: Deleted batch ${count++}.`);
    }

    console.log(`deleteEmailsInBatch: Total ${messages.length} emails deleted.`);
}

/*
 * getMailsForInputLabel - gets the details of label given by user
 */
const getMailsForInputLabel = async(label,gmail,getOrDeleteEmailUserRes) => {
  let nextPageToken = null;
  let messages = [];
  let batchNum = 1;

  console.log('Getting details for label',label)
    do {
      console.log(`Fetching total email count from label ${label} in batch ${batchNum++}`);
      const response = await gmail.users.messages.list({
        userId: 'me',
        labelIds: [`${label}`], // To filter emails in the Social category
        pageToken: nextPageToken,
      });
      nextPageToken = response.data.nextPageToken;
      if (response?.data?.messages) {
        messages = messages.concat(response.data.messages);
      }
    } while(nextPageToken)
    // console.log(messages.map(msg => msg.id));
    console.log(`Email count for given label ${label}: ${messages?.length || 0}`)
    if (getOrDeleteEmailUserRes === 2 && messages.length > 0) {
      console.log(`***** WARNING PROCEEDING TO DELETE EMAILS *****`)
      await deleteEmailsInBatch(gmail,messages)
    }
}


const listLabels = async(gmail,getOrDeleteEmailUserRes) => {
  try {
    const res = await gmail.users.labels.list({
      userId: 'me',
    });
    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
      console.log('No labels found.');
      return;
    }
    console.log('Labels:');
    console.log(labels.map((obj) => obj.id))
   
    const labelUserRes = await readLineAsync('which label details do you want , enter the name as it is? ');
    console.log('Your response was: ' + labelUserRes + ' — Thanks!');
    await getMailsForInputLabel(labelUserRes,gmail,getOrDeleteEmailUserRes)
    
  } catch (err) {
    console.error(`listLabels: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForIds - gets the count of emails from id given by user
 */
const listEmailCountForIds = async(gmail,getOrDeleteEmailUserRes) => {
  let nextPageToken = null;
  let messages = [];
  let batchNum = 1;
  try {
    const eid = await readLineAsync(`Enter the from email id: `);
    do {
      console.log(`Fetching total email count from email ${eid} in batch ${batchNum++}`);
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `from:${eid}`, // Query to filter emails from the specific sender
        pageToken: nextPageToken,
      });
      nextPageToken = response.data.nextPageToken;
        if (response?.data?.messages) {
          messages = messages.concat(response.data.messages);
        }
    } while (nextPageToken)
    console.log(`Email count from ${eid}: ${messages?.length || 0}`)
    
    if (getOrDeleteEmailUserRes === 2 && messages.length > 0) {
      console.log(`***** WARNING PROCEEDING TO DELETE EMAILS *****`)
      console.log(`***** STOP SERVER IF YOU WANT TO ABORT *****`)
      await deleteEmailsInBatch(gmail,messages)
    }
  } catch(err) {
    console.error(`listEmailCountForIds: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForAttachments - gets the count of emails having attachment size greater than user input
 */
const listEmailCountForAttachments = async(gmail,getOrDeleteEmailUserRes) => {
  let nextPageToken = null;
  let messages = [];
  let batchNum = 1;
  try {
  console.log(`Get email count having attachments greater than input size`)
    const size = await readLineAsync(`Enter size in mb: `);
    do {
      console.log(`Fetching total email count in batch ${batchNum++}`);
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: `has:attachment larger:${size}M`, // Query to filter emails from the specific sender
        pageToken: nextPageToken,
      });
      nextPageToken = response.data.nextPageToken;
        if (response?.data?.messages) {
          messages = messages.concat(response.data.messages);
        }
    } while (nextPageToken)
    console.log(`Email count having attachments greater than size ${size}mb: ${messages?.length || 0}`)
    
    if (getOrDeleteEmailUserRes === 2 && messages.length > 0) {
      console.log(`***** WARNING PROCEEDING TO DELETE EMAILS *****`)
      await deleteEmailsInBatch(gmail,messages)
    }

  } catch(err) {
    console.error(`listEmailCountForAttachments: error: ${err}`);
    throw err;
  }
}

/*
 * listEmailCountForCustomQuery - gets the count of emails for the given custom query
 */
const listEmailCountForCustomQuery = async(gmail,getOrDeleteEmailUserRes) => {
  let nextPageToken = null;
  let messages = [];
  let batchNum = 1;
  try{
    const query = await readLineAsync(`Enter custom query: `);
    do {
      console.log(`Fetching total email count in batch ${batchNum++}`);
      const response = await gmail.users.messages.list({
      userId: 'me',
      q: `${query}`, // Query to filter emails from the specific sender
      pageToken: nextPageToken,
    });
    nextPageToken = response.data.nextPageToken;
      if (response?.data?.messages) {
        messages = messages.concat(response.data.messages);
      }
    } while (nextPageToken)
    
    console.log(`Email count for given query ${query}: ${messages?.length || 0}`)
    if (getOrDeleteEmailUserRes === 2 && messages.length > 0) {
      console.log(`***** WARNING PROCEEDING TO DELETE EMAILS *****`)
      await deleteEmailsInBatch(gmail,messages)
    }
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
      await listLabels(gmail,Number(getOrDeleteEmailUserRes))
      break;
    case 2:
      await listEmailCountForIds(gmail,Number(getOrDeleteEmailUserRes))
      break;
    case 3:
      await listEmailCountForAttachments(gmail,Number(getOrDeleteEmailUserRes))
      break;
    case 4 :
      await listEmailCountForCustomQuery(gmail,Number(getOrDeleteEmailUserRes))
      break;
    default: 
    console.log(`Enter a valid input`)
  }
  rl.close();
}

module.exports = { getUserClassification }
