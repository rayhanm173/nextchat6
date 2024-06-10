'use client'
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import Dashboard from "@/component/dashboard/Dashboard";

export default function Home() {
  const {data:session}= useSession()

  if(session && session.user)
    {
      return(<div className="container">
            <Dashboard />
        </div>
        )
    }else{
  return (
    <div className="container">
      <div className="changeme">
      Welcome, It's time to sign in 
      <button onClick={()=>signIn('google')}>Sign in</button>
      </div>
    </div>
  );
}
}
