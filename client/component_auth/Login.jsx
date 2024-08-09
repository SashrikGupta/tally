import React from 'react'
import Card from '../components_basic/Card/Card'
import { useAuth0 } from "@auth0/auth0-react";
import {Link} from 'react-router-dom'







export default function Login() {
 const { loginWithRedirect } = useAuth0();






  return (
    <div className = "flex flex-col gap-2 h-[90vh] w-[100vw] justify-center items-center">
     <Card
     h = "80vh"
     w = "80vw"
     >
<div className='flex flex-col gap-2 h-[80vh] w-[70vw] justify-center items-center'>
  
<h1 style ={{fontSize : "24px"  , fontWeight:"bolder" , marginBottom : '20px'}}>Welcome to Code Connect</h1>

<p>
            Code Connect is a vibrant platform designed for passionate coders and learners alike. Whether you're
            seeking answers to perplexing coding problems or eager to share your expertise, Code Connect offers a
            collaborative environment where knowledge meets innovation.
        </p>
        <p>
            Our platform bridges the gap between questions and solutions, fostering a community-driven approach to
            problem-solving. With Code Connect, you can engage with like-minded individuals, exchange ideas, and
            participate in real-time coding sessions.
        </p>
        <p>
            Join us to explore a myriad of programming topics, from algorithms and data structures to web development
            and machine learning. Whether you're a seasoned developer or just starting your coding journey, Code Connect
            provides a supportive space for learning, networking, and honing your coding skills.
        </p>
        <p>
            Experience the power of collaboration and innovation with Code Connect. Dive into interactive coding
            challenges, discover new techniques, and connect with a global community passionate about coding excellence.
            Welcome to Code Connect – where coding enthusiasts unite to learn, share, and inspire.
        </p>
        <hr></hr>
      <div className = "flex w-[50vw] justify-center gap-3 ">
        <img src="./logo.png" className='h-[7vh] w-[7vh] rounded-xl' alt="" />
       <button className='btn btn-primary '  onClick={() => loginWithRedirect()}>Login with google</button> 
       
      </div>
      <div className='flex w-[70vw] justify-end h-[10vh] items-center'>
        <div className='flex-flex-col'>
          do not have an account <a><span className = "btn btn-danger"><Link to = "/signup" > create now </Link></span></a></div>
          </div>
</div>
     </Card>
      
    </div>
  )
}

