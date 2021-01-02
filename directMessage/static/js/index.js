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
    li.innerHTML = `<button onclick= convoButton(this.dataset.message) class="convo_btn table" data-message=${friend}>
  <strong class="convo_friend col">${friend}</strong>
  <p class="recent_message col">${recentMessage}</p>
  <span class="message_count col">${messageCount}</span>
  <span class="recent_date col">${recentMessageDate}</span>
  <hr>
  </button>`;
    ul.append(li);
  } else {
    document.querySelector('#no_convos').style.display = 'block';
  }
}
async function profilePage(currentUser) {
  console.log(currentUser);
  console.log(document.cookie);
  var date = new Date();
  var hours = date.getHours() + 5;
  console.log(hours);
  console.log(currentUser.last_login_hours);
  var hourSeen = hours - currentUser.last_login_hours;
  var minsSeen = date.getMinutes() - currentUser.last_login_minutes;
  let lastSeen =
    hourSeen === 0 ? `${minsSeen} mins ago` : `${hourSeen} hours ago`;

  console.log(minsSeen);
  console.log(lastSeen);
  // console.log(date.getMinutes() - currentUser.last_login_minutes);
  document.querySelector(
    '#user_div'
  ).innerHTML = `<div><h1 id="current_user_h1">${currentUser.profile}</h1>
  <br>
  ${currentUser.first_name} ${currentUser.last_name}
  <br>
  <span id="last_seen">Active ${lastSeen}</span>
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

async function directMessage(convo) {
  console.log(convo);
  document.querySelector('#heyhi').innerHTML = `<p>${convo}</p`;
}

function sendMessage(messageTo) {
  try {
    const messageText = document.querySelector('#message_content').value;
    fetch(`/message/${messageTo}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
        recipient: messageTo,
      }),
    });
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
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

function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie
    .split(';') //Cookie: <Name> = <Value> { ; <Name> = <Value> }
    .map((c) => c.trim())
    .filter((c) => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}
window.onload = async (event) => {
  const currentUserBtn = document.querySelector('#current_user');
  const userName = currentUserBtn.dataset.message;
  console.log(userName);
  const currentUser = await profileUser(userName);

  console.log(currentUser);
  profilePage(currentUser);

  const sendMessageBtn = document.querySelector('#send_message');
  const messageTo = sendMessageBtn.dataset.message;
  document
    .querySelector('#message_content')
    .addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        console.log('hi');
        sendMessage(messageTo);
      }
    });
  sendMessageBtn.addEventListener('click', async function () {
    sendMessage(messageTo);
  });
};
