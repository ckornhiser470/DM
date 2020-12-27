//refactor into seperate files

async function profileUser(userName) {
  const response = await fetch(`/user/${userName}`);
  const user = await response.json();
  return user;
}

async function getConvo(username) {
  try {
    const response = await fetch(`/message/${username}`);
    const messages = await response.json();
    return messages;
  } catch (error) {
    console.log(error);
  }
}

async function displayConvos(friend) {
  const currentConvoObj = await getConvo(friend);
  const currentConvo = currentConvoObj[currentConvoObj.length - 1];
  const recentMessage = currentConvo.message;
  const recentMessageDate = currentConvo.date;
  const messageCount = currentConvoObj.length;
  console.log(recentMessage);

  const ul = document.querySelector('#convo_ul');
  const li = document.createElement('li');
  li.innerHTML = `<button onclick= convoButton(this.dataset.message) class="convo_btn" data-message=${friend}>
  <strong>${friend}</strong>
  <span class="recent_message">${recentMessage}</span>
  <span class="message_count">${messageCount}</span>
  <span class="recent_date">${recentMessageDate}</span>
  </button>`;
  //${friend}<span class="recent_message">${recentMessage}</span><span class="message_count">${messageCount}</span><span class="recent_date">${recentMessageDate}</span></button>`;
  ul.append(li);
}
//vallue"${follower}<span class="recent_message">${recentMessage}</span><p>${recentMessageDate}</p><p>${messageCount}</p>">`
async function profilePage(currentUser) {
  console.log(currentUser);
  const date = new Date();
  const hours = date.getHours() + 5;
  console.log(hours);
  console.log(currentUser.last_login_hours);
  var lastSeen = hours - currentUser.last_login_hours;
  if (hours === currentUser.last_login_hours) {
    // const mins = date.getMinutes();
    lastSeen = currentUser.last_login_minutes;
  }
  document.querySelector(
    '#user_div'
  ).innerHTML = `<div><h1>${currentUser.profile}</h1>
  <br>
  ${currentUser.first_name} ${currentUser.last_name}
  <br>
  <span id="last_seen">Active ${lastSeen} hours ago</span>
  </div>`;
  document.querySelector(
    '#user_pic'
  ).innerHTML = `<img class="profile_img" src="${currentUser.profile_image}"></img>`;

  await currentUser.friends.forEach(displayConvos);
  // document.querySelector('.convo_btn').forEach(convoButton));
}
async function convoButton(m) {
  const myFriend = m;
  console.log(myFriend);
  window.location = `/dm/${myFriend}`;
}

// console.log('Whats up boo');
// const myFriend = btn.dataset.message;

// const myFriend = await btn.dataset.message;
// window.location = `/dm/${myFriend}`;
//   //   const convo = await getConvo(btn.dataset.message);
//   //   await directMessage(convo).then((window.location = '/dm'));
//   // });
// });

window.onload = async (event) => {
  const currentUserBtn = document.querySelector('#current_user');
  const userName = currentUserBtn.dataset.message;
  const currentUser = await profileUser(userName);
  console.log(currentUser);
  profilePage(currentUser);

  const sendMessageBtn = document.querySelector('#send_message');
  sendMessageBtn.addEventListener('click', async function () {
    const messageTo = sendMessageBtn.dataset.message;
    sendMessage(messageTo);
    window.location.reload();
  });
};

async function directMessage(convo) {
  console.log(convo);
  document.querySelector('#heyhi').innerHTML = `<p>${convo}</p`;
}

function sendMessage(messageTo) {
  const messageText = document.querySelector('#message_content').value;
  fetch(`/message/${messageTo}`, {
    method: 'POST',
    // credentials: 'same-origin',
    // // headers: {
    // //   'X-CSRFToken': getCookie('csrftoken'),
    // //   Accept: 'application/json',
    // //   'Content-Type': 'application/json',
    // // },
    body: JSON.stringify({
      message: messageText,
      recipient: messageTo,
    }),
  });
  // window.location.reload();
}
