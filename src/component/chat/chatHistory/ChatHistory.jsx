import './chathistory.css'
import {query, collection, orderBy, onSnapshot, limit, QuerySnapshot} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useRef, useState } from 'react'
import Message from '../Message/Message'
import moment from 'moment/moment'

export default function ChatHistory() {
    const [messages, setMessages]= useState([])
    const scrollRef=useRef(null)
    
    useEffect(()=>{
        const q= query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        )

        const unsubscribe= onSnapshot(q, (QuerySnapshot)=>{
            const fetchedMessages=[]
            QuerySnapshot.forEach(doc=>{
                
                const elapsedtime= doc.data().createdAt
                fetchedMessages.push({...doc.data(), id:doc.id})
                
            })
            const sortedMessages= fetchedMessages.sort((a,b)=> a.createdAt - b.createdAt)
                
            setMessages(sortedMessages)
            
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        })
        return ()=> unsubscribe ()
    },[])

    

   return (
       <div className="chathistory">
        
           {messages?.map(message=>(
                <Message key={message.id} message={message} />
           ))}
           <div ref={scrollRef}></div>
       </div>
   )
}
