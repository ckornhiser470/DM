//FETCH

//Returns user objects
async function profileUser(userName) {
  const response = await fetch(`/user/${userName}`);
  const user = await response.json();
  return user;
}

//Returns all users
async function getAllUsers() {
  const response = await fetch(`/users`);
  const users = await response.json();
  return users;
}

//Returns all the messages of a conversation between current user and a friend
async function getConvo(username) {
  try {
    const response = await fetch(`/message/${username}`);
    const himessages = await response.json();
    return himessages;
  } catch (error) {
    console.log(error);
  }
}

//Returns if current user is a sender or recipient of any messages
async function checkMessages(user) {
  const promise = await fetch(`/conversations/${user.id}`);
  const response = await promise.json();
  return response;
}

// Retrieves message content, creates new message, and 'sends' to friend
async function sendMessage(messageTo) {
  try {
    const messageText = document.querySelector('#message_content').value;
    const response = await fetch(`/message/${messageTo}`, {
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
    // Returns the newly created message object so that the new message can be displayed
    const messageObj = await response.json();
    document.querySelector('#message_content').value = '';
    const ul = document.getElementById('dm_ul');

    const li = document.createElement('li');
    li.innerHTML = `<div class="floatright">
    <li class="to">
        <div>
         <p class="to">${messageObj.message}</p>
         <p class="when_to">${messageObj.date}</p>
         </div>`;
    ul.append(li);
  } catch (err) {
    console.log(err);
  }
}

//Add or unadd a friend
async function friendshipStatus(friendID) {
  const currentUser = document.querySelector('#current_user').dataset.message;
  try {
    const promise = await fetch(`/user/${currentUser}`, {
      method: 'PUT',
      body: JSON.stringify({
        friendID,
      }),
    });
    //response is a JSON repsonse containing a message of action completed as well as the friend's username
    const response = await promise.json();
    console.log(response);

    // finds the div with the id of the user who's friendship status with the current user has been updated
    const friendDiv = document.getElementById(friendID);
    // Changes the button options based on if user was added as friend or unfriended
    if (response.message === 'friended') {
      friendDiv.innerHTML = `<button class="friend_btn" onclick= "friendshipStatus(this.dataset.message)" data-message="${friendID}">unfriend</button>
      <button class="message_btn" onclick= "convoButton(this.dataset.message)" data-message="${response.username}">message</button>`;
    } else {
      friendDiv.innerHTML = `<button class="friend_btn" onclick= "friendshipStatus(this.dataset.message)" data-message="${friendID}">add friend</button>`;
    }
  } catch (err) {
    console.log(err);
  }
}

//VIEWS CREATION, ADAPTATION, AND UPDATING

//Formats messages between the current user and a friend
async function displayConvos(friend) {
  //Retrieves profile object for friend
  const friendInfo = await profileUser(friend);
  console.log(friendInfo);
  const ul = document.querySelector('#convo_ul');
  //Retrieves the conversation object between the current user and friend with all of their messages
  const currentConvoObj = await getConvo(friend);
  console.log(currentConvoObj);
  //Index for most recent message for preview on the profile page
  const currentConvo = currentConvoObj[currentConvoObj.length - 1];
  const recentMessage = currentConvo.message;
  const recentMessageDate = currentConvo.date;
  const messageCount = currentConvoObj.length;
  const li = document.createElement('li');
  li.innerHTML = `<button onclick= convoButton(this.dataset.message) class="convo_btn table" data-message=${friend}>
  <img class="profile_img col" src="${friendInfo.profile_image}"></img>
  <strong class="convo_friend col">${friend}</strong>
  <p class="recent_message col">${recentMessage}</p>
  <span class="message_count col">${messageCount}</span>
  <span class="recent_date col">${recentMessageDate}</span>
  <hr>
  </button>`;
  ul.append(li);
}

//Creates elements for the profile page to information about the current user and any current conversationss
async function profilePage(user) {
  //checks if the current user has sent or has recieved any messages for display purposes
  const response = await checkMessages(user);

  document.querySelector(
    '#user_div'
  ).innerHTML = `<div><h1 id="current_user_h1">${user.profile}</h1>
  <br>
  ${user.first_name} ${user.last_name}
  <br>
  </div>`;
  document.querySelector(
    '#user_pic'
  ).innerHTML = `<img class="profile_img" src="${user.profile_image}"></img>`;
  console.log(response);
  // If the current user has no current conversations, "No messages yet!" is displayed on the profile page
  if (response.message === 'No messages') {
    document.getElementById('no_convos').style.display = 'block';
  }

  // Else, each conversation the current user has with a friend will be displayed using displayConvo()
  user.friends.forEach(displayConvos);
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
async function convoButton(myFriend) {
  window.location = `/dm/${myFriend}`;
}

//Every time the window loads, the following actions occurr if feasible
window.onload = async (event) => {
  //on window load, set up const from dataset messages as well as add a few event listeners
  const userName = document.querySelector('#current_user').dataset.message;
  const currentUser = await profileUser(userName);
  profilePage(currentUser);

  const url = document.location.href;
  const path = url.split('/');
  //path shows what page/view is being requested and then can direct to proper functions

  console.log(path[3]);
  const friend = path[4];
  if (path[3] === 'dm') {
    dmDisplay(friend);
  }
  if (path[3] === 'friends') {
    showUsers(currentUser);
  }
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
async function dmDisplay(friend) {
  const test = await getConvo(friend);
  const userInfo = await profileUser(friend);
  const friendLastSeen = lastSeenCalc(userInfo);
  document.getElementById(
    'dm_last_seen'
  ).innerHTML = `active ${friendLastSeen}`;
  const ul = document.getElementById('dm_ul');
  if (test) {
    test.forEach(function (message) {
      const li = document.createElement('li');
      if (friend === message.sender) {
        li.innerHTML = `<div>
        <p class="from">${message.message}</p>
         <p class="when_from">${message.date}</p>
         </div>`;
      } else {
        li.innerHTML = `<div class="floatright">
        <li class="to">
            <div>
             <p class="to">${message.message}</p>
             <p class="when_to">${message.date}</p>
             </div>`;
      }
      ul.append(li);
    });
  }
}
async function showUsers(currentUser) {
  console.log(currentUser);
  const ul = document.getElementById('user_list');
  const allUsers = await getAllUsers();
  allUsers.forEach(function (user) {
    console.log(user);
    const li = document.createElement('li');
    li.innerHTML = `<div class="user_profile" id="${user.profile}">
      <img class="user_profile_img" src="${user.profile_image}"/>
      <span class="user_username">${user.profile}</span>
      </div>`;
    ul.append(li);
    const div = document.createElement('div');
    if (currentUser.friends.includes(user.profile)) {
      div.innerHTML = `<button class="friend_btn" onclick= "friendshipStatus(this.dataset.message)" data-message="${user.id}">unfriend</button>
      <button class="message_btn" onclick= "convoButton(this.dataset.message)" data-message="${user.profile}">message</button>`;
    } else {
      div.innerHTML = `<button class="friend_btn" onclick="friendshipStatus(this.dataset.message)" data-message="${user.id}">add friend</button>`;
    }
    div.classList.add('friendship_btn_div');
    div.id = user.id;
    document.getElementById(user.profile).appendChild(div);
  });
}
//Calculates the hours or minutes since a user was last logged in
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
