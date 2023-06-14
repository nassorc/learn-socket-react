import { useState } from "react";
import SidePanel from "./SidePanel";

function Chat({userList, setUserList, onSendMsg}) {
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState({});

    const handleUserSelect = (userID) => {
        setSelectedUser(userList?.filter(user => user.userID === userID)[0]);
        setUserList(prev => {
            return prev.map(user => {
                if(user.userID === userID) {
                return {...user, hasNotification: false};
                }
                return user;
            })
        })
        // setSelectedUser(userID);
    }

    const handleSendMsg = (e) => {
        // console.log(`about to send ${message} to ${selectedUser.username}`);
        if(!selectedUser) return
        onSendMsg(selectedUser.userID, message);
        setMessage("");
    }

    return(
        <div className="flex">
            <SidePanel userList={userList} onUserSelect={handleUserSelect}/>
            <div>
                <span>to: </span><span>{selectedUser.username}</span>
                <div className="h-[400px] max-h-[400px] w-[300px] bg-[#424242] overflow-y-scroll">
                    <div className="h-[500px]"></div>

                </div>
                <div>
                    <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="enter"/>
                    <button onClick={handleSendMsg}>send</button>
                </div>
            
            </div>
        </div>
    )
}
export default Chat;