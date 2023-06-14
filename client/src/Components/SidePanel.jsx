function SidePanel({userList, onUserSelect}) {
    return(
        <div>
        {
            userList && userList?.map(user => {
            return (
                <div key={user.userID}>
                <span>{user.username}</span>
                <button onClick={() => {
                    onUserSelect(user.userID)
                    // setHasNotification(false);
                }}>msg</button>
                <span className={`mx-1 my-auto inline-flex w-4 h-4 ${user.online ? "bg-green-400" : "bg-orange-400"}`}></span>
                <span className={`mx-1 ${user.hasNotification ? "inline-flex" : "hidden"} justify-center items-center w-4 h-4 bg-pink-400`}>!</span>
                </div>
            )
            })
        }
        </div>
    )
}

export default SidePanel;