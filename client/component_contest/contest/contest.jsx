import React, { useEffect, useState } from 'react';
import { Link , useParams } from 'react-router-dom';
import Card from '../../components_basic/Card/Card';


export default function Contest() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cid , set_cid] = useState() ; 
  const { id } = useParams();
  let data 
  useEffect(() => {
    (async () => {
      setLoading(true);
      const contest = await fetch(`http://localhost:1934/contest/${id}`);
       data = await contest.json();
       console.log(data)
      setProblems(data.data.contest.problems);
      set_cid(data.data.contest._id)
      setLoading(false);
    })();
  }, [id]);

  

  // Helper function to truncate the description
  const truncateDescription = (desc) => {
    const words = desc.split(' ');
    return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : desc;
  };

  return (
    <div className='h-[90vh] w-[100vw] flex flex-col justify-around items-center'>
      <Card h='10vh' w='80vw' tailwind='border-2'>
        <span className='text-white text-3xl font-bold'>Problems | </span>
        <Link to = {`/globalrank/${id}`}><span className='text-white text-3xl'>Global rankings  </span></Link>
      </Card>
      <Card h='70vh' w='80vw' tailwind='border-2'>
        <div className='h-[70vh] w-[80vw] flex p-4 justify-center overflow-y-auto'>
          {loading ? (
            <div className='text-white text-center text-2xl'>Loading...</div>
          ) : (
            <div className='w-[77vw] h-[67vh]'>
              <table className='w-full text-white border-collapse'>
                <thead>
                  <tr className='bg-gray-700'>
                    <th className='border border-gray-600 px-4 py-2'>Problem Name</th>
                    <th className='border border-gray-600 px-4 py-2'>Description</th>
                    <th className='border border-gray-600 px-4 py-2'>Difficulty</th>
                    <th className='border border-gray-600 px-4 py-2'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem._id} className=''>
                      <td className='border border-gray-600 px-4 py-2'>{problem.name}</td>
                      <td className='border border-gray-600 px-4 py-2'>
                        {truncateDescription(problem.desc)}
                      </td>
                      <td className='border border-gray-600 px-4 py-2'>{problem.difficulty}</td>
                      <td className='border border-gray-600 px-4 py-2'>
                       <Link to ={`/problem/${problem._id}`}
                                       state={{ cid: cid}}
                       >{console.log(cid )}
                        <button className='btn btn-primary'>Solve</button></Link> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
