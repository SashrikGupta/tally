import React, { useEffect, useState, useContext } from 'react';
import Card from '../components_basic/Card/Card';
import { Link, useNavigate } from 'react-router-dom';
import { curr_config } from '../contexts/Conf';

export default function List() {
   const [contest, set_contest] = useState([]); 
   const [loading, set_loading] = useState(false); 
   const { logged_in_userid } = useContext(curr_config); // Fetching user details
   const navigate = useNavigate();

   useEffect(() => {
      (async () => {
         set_loading(true);
         try {
            const response = await fetch("http://localhost:1934/contest/getContest");
            const json = await response.json();
            set_contest(json.data.contests);
         } catch (error) {
            console.error('Error fetching contests:', error);
         } finally {
            set_loading(false);
         }
      })();
   }, []);

   const handleEnterContest = async (contestId) => {
      if (!logged_in_userid) {
         alert('User not authenticated. Please log in.');
         return;
      }

      try {
         const response = await fetch("http://localhost:1934/contest/createResult", {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               contest: contestId,
               user: logged_in_userid,
            }),
         });

         const result = await response.json();

         if (response.ok) {
            console.log('Result created successfully:', result);
            // Navigate to the contest page after successful result creation
            navigate(`/contest/${contestId}`, { state: { cid: contestId } });
         } else {
            console.error('Error creating result:', result.message);
            alert('Failed to enter the contest. Please try again.');
         }
      } catch (error) {
         console.error('Error during API call:', error);
         alert('An unexpected error occurred. Please try again.');
      }
   };

   return (
      <div className='h-[90vh] w-[100vw] flex justify-around items-center'>
         <Card w='70vw' h='80vh'>
            <div className='h-[80vh] w-[67vw] overflow-x-auto overflow-y-auto p-4'>
               {loading ? (
                  <div className='text-center text-white'>Loading contests...</div>
               ) : (
                  <table className='w-full text-white border-collapse'>
                     <thead>
                        <tr>
                           <th className='border border-aqua px-4 py-2 text-[aqua]'>Name</th>
                           <th className='border border-aqua px-4 py-2 text-[aqua]'>Writers</th>
                           <th className='border border-aqua px-4 py-2 text-[aqua]'>Start</th>
                           <th className='border border-aqua px-4 py-2 text-[aqua]'>Length</th>
                           <th className='border border-aqua px-4 py-2 text-[aqua]'>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {contest.map((contestItem) => (
                           <tr key={contestItem._id}>
                              <td className='border border-aqua px-4 py-2'>{contestItem.name}</td>
                              <td className='border border-aqua px-4 py-2'>{contestItem.author.username}</td>
                              <td className='border border-aqua px-4 py-2'>
                                 {new Date(contestItem.start).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}{' '} <br />
                                 {new Date(contestItem.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className='border border-aqua px-4 py-2'>
                                 {Math.abs(new Date(contestItem.start) - new Date(contestItem.end)) / (1000 * 60 * 60)}:00
                              </td>
                              <td className='border border-aqua px-4 py-2'>
                              <button 
                                 className={`btn btn-${contestItem.message}`} 
                                 onClick={() => handleEnterContest(contestItem._id)}
                                 disabled={contestItem.message === 'danger' || contestItem.message === 'secondary'}
                                 >
                                 Enter
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </Card>
         <Card h='80vh' w='20vw' tailwind='flex-col justify-between'>
            <div className='h-[2vh]'></div>
            <div className='text-[3vh] font-bold text-[aqua]'>The Battle Ground</div>
            <hr />
            <div className='w-[16vw]'>
               <div className='h-[2vh]'></div>
               <div className='h-[2vh]'></div>
               Coding contests enhance problem-solving by challenging efficient solution development under time constraints, fostering strong algorithmic and computational thinking.
               <div className='h-[2vh]'></div>
               <div className='h-[2vh]'></div>
               <hr />
               <div className='font-bold text-[aqua]'>
                  Wanna develop your own contest?
               </div>
               <div>
                  Users with a rating over 800 can develop their own contest.
               </div>
               <Link to="/add_contest" className='mt-2 h-[6vh] w-[16vw] btn btn-success'>
                  Create Now!
               </Link>
            </div>
            <div className='h-[2vh]'></div>
         </Card>
      </div>
   );
}
