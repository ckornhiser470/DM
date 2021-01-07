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

function lastSeenCalc(user) {
  var date = new Date();
  var hours = date.getHours() + 5;
  console.log(hours);
  console.log(user.last_login_hours);
  let hourSeen =
    hours >= user.last_login_hours
      ? hours - user.last_login_hours
      : user.last_login_hours - hours;
  var minsSeen = date.getMinutes() - user.last_login_minutes;
  let lastSeen =
    hourSeen === 0 ? `${minsSeen} mins ago` : `${hourSeen} hours ago`;
  return lastSeen;
}

async function profilePage(user) {
  const userLastSeen = lastSeenCalc(user);

  document.querySelector(
    '#user_div'
  ).innerHTML = `<div><h1 id="current_user_h1">${user.profile}</h1>
  <br>
  ${user.first_name} ${user.last_name}
  <br>
  <span id="last_seen">Active ${userLastSeen}</span>
  </div>`;
  document.querySelector(
    '#user_pic'
  ).innerHTML = `<img class="profile_img" src="${user.profile_image}"></img>`;

  await user.friends.forEach(displayConvos);
  // document.querySelector('.convo_btn').forEach(convoButton));
}
async function convoButton(m) {
  const myFriend = m;
  window.location = `/dm/${myFriend}`;
}

async function directMessage(convo) {
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
        //console.log(document.cookie) prints 'csrftoken =...'
        //so we pass the 'csrftoken' as the name to getCookie()
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
  //function for adding or unadding a friend
  const currentUser = document.querySelector('#current_user').dataset.message;
  try {
    const response = await fetch(`/user/${currentUser}`, {
      method: 'PUT',
      body: JSON.stringify({
        friend,
      }),
    });
    await response.then(window.location.reload());
  } catch (err) {
    console.log(err);
  }
}

function changePic() {
  //toggles the show and hide of the form for uploading a profile picture
  document.querySelector('#update_img_btn').style.display = 'none';
  document.querySelector('#update_form').style.display = 'block';
}
function reLoad() {
  //used for 'Cancel' button
  window.location.reload();
}

function getCookie(name) {
  //takes in the name, in this case 'csrftoken'
  if (!document.cookie) {
    return null;
  }
  //Normally can use the {{csrf_token}} with Django, but this JS function shows how to extract cookie in order to use for a header/authentication
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
  //on window load, set up const from dataset messages as well as add a few event listeners

  const userName = document.querySelector('#current_user').dataset.message;

  const currentUser = await profileUser(userName);
  profilePage(currentUser);

  const sendMessageBtn = document.querySelector('#send_message');
  const messageTo = sendMessageBtn.dataset.message;

  //can send message using the 'Enter' button
  document
    .querySelector('#message_content')
    .addEventListener('keypress', function (e) {
      if (e.key === 'Enter') sendMessage(messageTo);
    });

  //otherwise, send message from the 'Send' button
  sendMessageBtn.addEventListener('click', async function () {
    sendMessage(messageTo);
  });
};
