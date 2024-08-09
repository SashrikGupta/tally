import React, { useState , useEffect , useContext  } from 'react';
import { curr_config } from '../contexts/Conf';
import Card from '../components_basic/Card/Card';
import img from '../public/logo.png'
import {useNavigate} from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate() ; 
  const now_config = useContext(curr_config) ; 
  const back_key = now_config.back_key ; 
  console.log(back_key) ; 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    nickname: '',
    description: '',
    year: '',
    otp: '',
  });
  const [button , set_button] = useState(false) ; 
  const [user, setUser] = useState({});
  const [goodresponse , set_goodresponse] = useState(false) ; 
  const [systemOTP , set_systemOTP] = useState(Math.floor(100000 + Math.random() * 900000)) ; 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSendOTP = () => {
    // Implement logic to send OTP to email here
    console.log('OTP sent to email');
  
    // Delayed logging of OTP after one second
    setTimeout(() => {
      fetch(`${back_key}/mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(
          {
            mailId : `${formData.email}` , 
            subject : "Thanks for choosing Code Connect" , 
            message : `your otp is ${systemOTP} `
          }
        ),
      }).catch(error => console.error('Error fetching data:', error));
    }, 1000);
  };
  
  
  const handleSubmit = (e) => {
    const { otp, email } = formData;
    console.log(systemOTP) // Example OTP stored in the system, replace with actual implementation
    console.log(otp) ; 
    if (otp == systemOTP) {
      // Check if email exists before submitting
      fetch(`${back_key}/checkuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email }),
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Failed to fetch data');
          }
        })
        .then(data => {
          if (data.status === "FAILED") {
            alert("Email already exists");
          } else {
            // Email doesn't exist, proceed with submitting the user
            alert('OTP verified successfully');
            setUser(formData); // Storing form data in the user variable
            console.log(formData); // Logging form data to the console
            // You can add further logic here, such as submitting the form data to a backend API
            

            fetch(`${back_key}/user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
              },
              body: JSON.stringify({
                 username : formData.username , 
                 email : formData.email , 
                 age : formData.age , 
                 nickname : formData.nickname , 
                 rating : 4.2 , 
                 points : 500 , 
                 description : formData.description , 
                 year: formData.year
              }),
            })
              .then(res => {
                if (res.ok) {
                  return res.json();
                } else {
                  throw new Error('Failed to add data');
                }
              }).then((data)=>{
                console.log(data) ; 
                console.log(data.data.user) ; 
              })



            // Clearing the form fields
            setFormData({
              username: '',
              email: '',
              age: '',
              nickname: '',
              description: '',
              year: '',
              otp: '',
            });
            navigate(`/login` , {
              state : {
                 username , 
              }
           })
        
          }
        })
        .catch(error => console.error('Error fetching data:', error));
  
      e.preventDefault();
    } else {
      alert('Incorrect OTP');
    }
  };
  

  







  return (
    
    <div className='flex  flex-col h-[100vh] w-[100vw] justify-center items-center'>
      <Card 
      h = '5vh'
      tailwind = "mb-2 text-[24px] "
      w = '60vh'

      >
        <div className='flex w-[50vw] items-center justify-center gap-2'>

        <img src = '../public/logo.png' className='w-[4vh] h-[4vh] rounded-l rounded-r'></img>
          SIGN UP
        </div> 
      </Card>
      <Card 
      h = '90vh'
      w = '60vh'
      p = '5'
      tailwind = "overflow-y-scroll "
    
      >
      <form className='h-[90vh]'>
        <label className = "mt-10" htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          className='h-[5vh] w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0'
          value={formData.username}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          className='h-[5vh] w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0'
          value={formData.email}
          onChange={handleInputChange}
          required
        />
          <div className='flex w-[50vh] justify-center'>
           <button type="button" className='btn btn-danger mt-4 ' onClick={handleSendOTP}>
                    Send OTP
            </button>
          </div>
          

       <div >
       <label htmlFor="otp">OTP:</label>
        <input
          type="text"
          id="otp"
          name="otp"
          className='h-[5vh] w-[30vh] backdrop-clur bg-white/10 border rounded-xl my-0'

          value={formData.otp}
          onChange={handleInputChange}
          required
        />
        </div>   
        

        <label htmlFor="age">Age:</label>
        <input
          type="text"
          id="age"
          name="age"
          className='h-[5vh] w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0'
          value={formData.age}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="nickname">Nickname:</label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          className='h-[5vh] w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0'
          value={formData.nickname}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          className=' w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0'
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe in 20-30 words"
          required
        ></textarea>

        <label htmlFor="year">Year:</label>
        <select
          id="year"
          name="year"
          value={formData.year}
          className='h-[5vh] w-[50vh] backdrop-clur bg-white/10 border rounded-xl my-0 '
          onChange={handleInputChange}
          required
        >
          <option className='text-black' value="">Select Year</option>
          <option className='text-black' value="1st year">1st year</option>
          <option className='text-black' value="2nd year">2nd year</option>
          <option className='text-black' value="3rd year">3rd year</option>
          <option className='text-black' value="4th year">4th year</option>
        </select>



        <div className='flex justify-center items-center h-[10vh]'>
        <button type="button " className='btn btn-success' onClick={(e)=>{ set_button(!button) ; handleSubmit(e)}}>
          Submit
        </button>
        </div>

      </form>
      </Card>
    </div>
  );
}
