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
  if (currentConvoObj) {
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
  </button><hr>`;
    ul.append(li);
  } else {
    document.querySelector('#no_convos').style.display = 'block';
  }
}
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

window.onload = async (event) => {
  const currentUserBtn = document.querySelector('#current_user');
  const userName = currentUserBtn.dataset.message;
  console.log(userName);
  const currentUser = await profileUser(userName);

  console.log(currentUser);
  profilePage(currentUser);

  // const changePicBtn = document.querySelector('#update_img_btn')

  const sendMessageBtn = document.querySelector('#send_message');
  sendMessageBtn.addEventListener('click', async function () {
    const messageTo = sendMessageBtn.dataset.message;
    sendMessage(messageTo);
  });
};

async function directMessage(convo) {
  console.log(convo);
  document.querySelector('#heyhi').innerHTML = `<p>${convo}</p`;
}

function sendMessage(messageTo) {
  try {
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
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
  // window.location.reload();
}
async function friendshipStatus(friend) {
  const currentUser = document.querySelector('#current_user').dataset.message;
  try {
    const response = await fetch(`/user/${currentUser}`, {
      method: 'PUT',
      body: JSON.stringify({
        friend,
      }),
    });
    window.location.reload();
    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

function changePic() {
  document.querySelector('#update_img_btn').style.display = 'none';
  document.querySelector('#update_form').style.display = 'block';
}
function reLoad() {
  window.location.reload();
}
