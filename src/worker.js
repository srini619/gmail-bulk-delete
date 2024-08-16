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
  if (!labels || labels === null) {
      console.log('No labels found.');
      return;
    }
    const labelDetails = await gmail.users.labels.get({
      userId: 'me',
      id: label
    });
    return labelDetails.data
}


const listLabels = async(gmail) => {
  const res = await gmail.users.labels.list({
    userId: 'me',
  });
  labels = res.data.labels;
  // console.log(res.data.messagesTotal,'messageTotal')
  if (!labels || labels.length === 0) {
    console.log('No labels found.');
    return;
  }
  console.log('Labels:');
  console.log(labels.map((obj) => obj.id))
 
//   await Promise.allSettled(labels.map(async(label) => {
//     console.log(`- ${label.name}`);
    
//     // if (label) {
//     //     const labelDetails = await gmail.users.labels.get({
//     //       userId: 'me',
//     //       id: label.id
//     //     });
//     //     // console.log(labelDetails.data, 'labelDetails.data')
//     // }

//   })
// );

// console.log(labels)

const userRes = await readLineAsync('which label details do you want , enter the name as it is? ');
rl.close();
console.log('Your response was: ' + userRes + ' — Thanks!');
  const abc =  await getMailsForInputLabel(userRes,gmail)
  console.log(abc)
// const finalMails = await getMailsPerLabel(labels,gmail)
// console.log(finalMails,'FINALMAILS')
return gmail
}

/*
 * getMailsForInputLabel - gets the count of emails from id given by user
 */
const listEmailCountForIds = async(gmail) => {
  const eid = await readLineAsync(`Enter the from email id: `);
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: `from:${eid}`, // Query to filter emails from the specific sender
  });
  const messages = response.data.messages;
  console.log(`Email count from ${eid}: ${messages?.length || 0}`)
  rl.close();
  
}

/*
 * listEmailCountForAttachments - gets the count of emails having attachment size greater than user input
 */
const listEmailCountForAttachments = async(gmail) => {
console.log(`Get email count having attachments greater than input size`)
  const size = await readLineAsync(`Enter size in mb: `);
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: `has:attachment larger:${size}M`, // Query to filter emails from the specific sender
  });
  const messages = response.data.messages;
  console.log(`Email count having attachments greater than size ${size}mb: ${messages?.length || 0}`)
  rl.close();
}

/*
 * listEmailCountForCustomQuery - gets the count of emails for the given custom query
 */
const listEmailCountForCustomQuery = async(gmail) => {
  console.log(`Get email count having attachments greater than input size`)
    const query = await readLineAsync(`Enter size in mb: `);
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `${query}`, // Query to filter emails from the specific sender
    });
    const messages = response.data.messages;
    console.log(`Email count having attachments greater than size ${size}mb: ${messages?.length || 0}`)
    rl.close();
    
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
