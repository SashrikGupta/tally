import React, { useState  , useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components_basic/Card/Card';
import {curr_config} from '../../contexts/Conf';

export default function Addq({ name, start, end }) {
   const now_config = useContext(curr_config)
   console.log(now_config)
  const [questions, set_questions] = useState([]);
  const [test_in, set_test_in] = useState([]);
  const [q_name, set_q_name] = useState('');
  const [test_out, set_test_out] = useState([]);
  const [points, set_points] = useState('');
  const [tag, set_tag] = useState('');
  const [problem_statement, set_problem_statement] = useState('');
  const [current_in, set_current_in] = useState('');
  const [current_out, set_current_out] = useState('');
  const navigate = useNavigate();

  const handleAddTestCase = () => {
    set_test_in([...test_in, current_in]);
    set_test_out([...test_out, current_out]);
    set_current_in('');
    set_current_out('');
  };

  const handleAddMoreQuestion = async () => {
    const qr = {
      name: q_name,
      tag,
      difficulty: points,
      desc: problem_statement,
      sample_input: test_in,
      sample_output: test_out,
      testcase_input: test_in,
      testcase_output: test_out,
      points
    };
    
    try {
      const response = await fetch('http://localhost:1934/contest/addProblem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qr),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.data.problem);
        set_questions((prevQuestions) => [...prevQuestions, data.data.problem]); // Assuming `_id` is returned
        resetForm();
      } else {
        console.error('Error adding problem:', data.message);
      }
    } catch (error) {
      console.error('Error in request:', error);
    }
  };

  const handleSubmit = async () => {
    await handleAddMoreQuestion();
    console.log(questions)
    try {
      const response = await fetch('http://localhost:1934/contest/addContest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problems: questions,
          author: now_config.logged_in_userid , // Replace with the actual author ID or state
          start: start, // Ensure that `start` and `end` are provided correctly
          end: end,
          name: name // Ensure that `name` is provided correctly
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data.data.contest);
        navigate('/'); // Navigate to the desired page after successful contest creation
      } else {
        console.error('Error adding contest:', data.message);
      }
    } catch (error) {
      console.error('Error in request:', error);
    }
  };

  const resetForm = () => {
    set_q_name('');
    set_points('');
    set_tag('');
    set_problem_statement('');
    set_test_in([]);
    set_test_out([]);
    set_current_in('');
    set_current_out('');
  };

  return (
    <div className='h-[90vh] w-[100vw] flex justify-around items-center'>
      <Card h='80vh' w='50vw'>
        <div className='w-[50vw] h-[80vh] flex flex-col justify-around items-center'>
          <div className='w-[48vw] flex justify-between'>
            <input
              type="text"
              className="w-[15vw] p-2 border border-gray-300 rounded-md bg-white/30 placeholder-white"
              placeholder="Enter question name"
              value={q_name}
              onChange={(e) => set_q_name(e.target.value)}
            />
            <select
              className="w-[10vw] p-2 border border-gray-300 rounded-md bg-white/30"
              value={points}
              onChange={(e) => set_points(e.target.value)}
            >
              <option value="" disabled>
                Points
              </option>
              {[50, 100, 150, 200].map((points) => (
                <option key={points} value={points}>
                  {points}
                </option>
              ))}
            </select>
            <select
              className="w-[10vw] p-2 border border-gray-300 rounded-md bg-white/30"
              value={tag}
              onChange={(e) => set_tag(e.target.value)}
            >
              <option value="" disabled>
                Tag
              </option>
              {['Easy', 'Medium', 'Hard'].map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div className='w-[50vw] h-[68vh] flex justify-around'>
            <textarea
              className='w-[48vw] p-2 border border-gray-300 rounded-md bg-white/10 placeholder-white'
              placeholder="Enter question description"
              value={problem_statement}
              onChange={(e) => set_problem_statement(e.target.value)}
            ></textarea>
          </div>
        </div>
      </Card>
      <Card h='80vh' w='40vw'>
        <div className='w-[40vw] flex flex-col items-center'>
          <textarea
            className='w-[38vw] h-[28vh] mb-2 p-2 border border-gray-300 rounded-md bg-white/10 placeholder-white'
            placeholder="test case inputs"
            value={current_in}
            onChange={(e) => set_current_in(e.target.value)}
          ></textarea>
          <textarea
            className='w-[38vw] h-[28vh] p-2 mb-2 border border-gray-300 rounded-md bg-white/10 placeholder-white'
            placeholder="test case outputs"
            value={current_out}
            onChange={(e) => set_current_out(e.target.value)}
          ></textarea>
          <button
            className='btn btn-success w-[38vw] mb-3'
            onClick={handleAddTestCase}
          >
            + test case
          </button>
          <div className='w-[38vw] flex justify-between'>
            <button
              className='btn btn-primary w-[18vw]'
              onClick={handleAddMoreQuestion}
            >
              Add more Question
            </button>
            <button
              className='btn bg-[red]/70 w-[18vw] text-[white]'
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
