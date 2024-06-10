
import Chat from "../chat/Chat";
import UserInfo from "../userInfo/UserInfo";
import './dashboard.css'

export default function Dashboard() {

   return (
        <>
            <div className="wrapper">
                
                <Chat />
                <div className='separator'></div>
                <UserInfo />
            </div>
          </>
   )
}
