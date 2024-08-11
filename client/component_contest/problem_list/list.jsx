import React, { useState, useEffect, useContext } from 'react';
import Card from '../../components_basic/Card/Card';
import { Link } from 'react-router-dom';
import { curr_config } from '../../contexts/Conf';

export default function ProList() {
  const { logged_in_userid } = useContext(curr_config);

  const [loading, set_loading] = useState(false);
  const [problems, set_problems] = useState([]);
  const [you, set_you] = useState();
  const [selectedTag, setSelectedTag] = useState('All'); // Added state for selected tag

  useEffect(() => {
    (async () => {
      set_loading(true);
      const response = await fetch("http://localhost:1934/contest/run/getall");
      const data = await response.json();
      set_problems(data.data.problems);
      console.log(data.data);
      if (logged_in_userid) {
        const response2 = await fetch(`http://localhost:1934/contest/your/plist/${logged_in_userid}`);
        const data2 = await response2.json();
        const arr = data2.data.codes.map(element => element.problem._id);
        set_you(arr);
        console.log(arr);
      }
      set_loading(false);
    })();
  }, [logged_in_userid]);

  const truncateDescription = (desc) => {
    const words = desc.split(' ');
    return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : desc;
  };

  const check = (element) => {
    return you?.includes(element);
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
  };


  const filteredProblems = selectedTag === 'All'
    ? problems
    : problems.filter(problem => problem.tag === selectedTag);

  return (
    <div className='h-[90vh] w-[100vw] flex justify-around items-center'>
      <Card w='70vw' h='80vh'>
        <div className='h-[70vh] w-[78vw] flex p-4 justify-center overflow-y-auto hide-scrollbar'>
          {loading ? (
            <div className='text-white text-center text-2xl'>Loading...</div>
          ) : (
            <div className='w-[60vw] h-[67vh]'>
              {/* Filter Buttons */}
              <div className='mb-4'>
                <button
                  onClick={() => handleTagFilter('All')}
                  className={`px-4 py-2 mr-2 ${selectedTag === 'All' ? 'bg-blue-500 text-white rounded-lg' : ''}`}
                >
                  All
                </button>
                <button
                  onClick={() => handleTagFilter('Easy')}
                  className={`px-4 py-2 mr-2 ${selectedTag === 'Easy' ? 'bg-green-500 text-white rounded-lg' : ''}`}
                >
                  Easy
                </button>
                <button
                  onClick={() => handleTagFilter('Medium')}
                  className={`px-4 py-2 mr-2 ${selectedTag === 'Medium' ? 'bg-yellow-500 text-white rounded-lg' : ''}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => handleTagFilter('Hard')}
                  className={`px-4 py-2 ${selectedTag === 'Hard' ? 'bg-red-500 text-white rounded-lg' : ''}`}
                >
                  Hard
                </button>
              </div>
              <table className='w-[60vw] text-white'>
                <thead>
                  <tr className='bg-gray-700'>
                    <th className='px-4 py-2'>Sr no</th>
                    <th className='px-4 py-2'>Problem Name</th>
                    <th className='px-4 py-2'>Description</th>
                    <th className='px-4 py-2'>Difficulty</th>
                    <th className='px-4 py-2'>Points</th>
                    <th className='px-4 py-2'>Action</th>
                    <th className='px-4 py-2'>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((element, index) => (
                    <tr key={element._id} className='border-b border-gray-600'>
                      <td className='px-4 py-2'>{index + 1}</td>
                      <td className='px-4 py-2 text-[aqua]'>{element.name}</td>
                      <td className='px-4 py-2'>{truncateDescription(element.desc)}</td>
                      <td className={`px-4 py-2 ${getTagColor(element.tag)}`}>
                        {element.tag}
                      </td>
                      <td className='px-2 py-2'>{element.points}🪙</td>
                      <td className='px-4 py-2'>
                        <Link to={`/problem/${element._id}`} className='text-blue-400 hover:underline'>
                          Attempt
                        </Link>
                      </td>
                      <td className='px-4 py-2'>
                        {check(element._id) ? '✅' : '🧑‍💻'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      <Card h='80vh' w='20vw' tailwind='flex-col justify-between'>
        <div className='h-[2vh]'></div>
        <div className='text-[3vh] font-bold text-[aqua]'>The Arena</div>
        <hr />
        <div className='w-[16vw]'>
          <div className='h-[2vh]'></div>
          Solving coding problems involves understanding the problem requirements, designing an efficient algorithm, and implementing the solution with clean, bug-free code.
          <div className='h-[2vh]'></div>
          <hr />
          <div className='font-bold text-[aqua]'>
            Wanna develop your own question?
          </div>
          <div>
            Users with a rating over 800 can develop their own question.
          </div>
          <Link to="/add_prob" className='mt-2 h-[6vh] w-[16vw] btn btn-primary'>
            Create Now!
          </Link>
        </div>
        <div className='h-[2vh]'></div>
      </Card>
    </div>
  );
}
