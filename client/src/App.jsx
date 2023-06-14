import { useContext, useEffect, useState } from "react";
import UserSelect from "./Components/UserSelect";
import Chat from "./Components/Chat";
// import SocketContext from "./context/socket";
import { io } from "socket.io-client";
function App() {
  // const socket = useContext(SocketContext);
  const [usernameSelected, setUsernameSelected] = useState(false);
  const [userList, setUserList] = useState([]);
  const [socket, setSocket] = useState(() => io("http://localhost:3000", {autoConnect: false}));
  const [sessionID, setSessionID] = useState(() => (localStorage.getItem("sessionID")) ? localStorage.getItem("sessionID") : "");

  useEffect(() => {
    // check if user exists;
    (async function() {
      if(sessionID) {
        socket.auth = { sessionID  };
        await socket.connect()
        setUsernameSelected(true);
      }
    })();
    return () => {
      socket.disconnect();
    }
  }, [socket, sessionID]);

  useEffect(() => {
      function onSession({sessionID, userID}) {
        localStorage.setItem("sessionID", sessionID);
        socket.auth = { sessionID } // attaches userid on reconnection
        socket.userID = userID;
      }
      function onUsers(data) {
        setUserList(data.map(user => ({...user, hasNotification: false})));
      }
      function onOtherUserConnected(user) {
        console.log("got user", user);
        setUserList(prev => [...prev, user]);
      }
      function onOtherUserDisconnect(data) {
        setUserList(prev => {
          return (prev.map(user => {
            if(user.userID == data.userID) return {...user, online: false};
            else return user;
          }))
        });
      }
      function onNewMessage(data) {
        console.log(data);
      }
      function onPrivateMessage({content, from}) {
        console.log(`'${content}' from ${from}`);
        // notification
        setUserList(prev => {
          return prev.map(user => {
            if(user.userID === from) {
              return {...user, hasNotification: true};
            }
            return user;
          })
        })
      }

      socket.on("session", onSession);
      socket.on("users", onUsers);
      socket.on("user connected", onOtherUserConnected);
      socket.on("user disconnect", onOtherUserDisconnect);
      socket.on("message from user", onNewMessage);
      socket.on("private message", onPrivateMessage);
      socket.on("healthcheck", (data) => {
        console.log(`HEALTH CHECK MSG: ${data}`);
      })

      return () => {
        socket.off("session", onSession);
        socket.off("users", onUsers);
        socket.off("user connected", onOtherUserConnected);
        socket.off("user disconnect", onOtherUserDisconnect);
        socket.off("message from user", onNewMessage);
        socket.off("private message", onPrivateMessage);
        socket.disconnect();
      }
  }, []);
  
  const handleSendMsg = async (to, message) => {
    // await socket.emit("send message", message);
    socket.emit("private message", {
      content: message,
      to: to,
    })
  }

  const handleConnect = async (username) => {
    socket.auth = { username };
    await socket.connect();
    setUsernameSelected(true);
  }

  return (
    <section>
      { !usernameSelected 
        ? <UserSelect onConnect={handleConnect}/> 
        : <Chat userList={userList} setUserList={setUserList} onSendMsg={handleSendMsg} />
      }
    </section>
  )
}

export default App
