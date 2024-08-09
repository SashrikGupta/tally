import React, { useContext, useState } from 'react';
import Card from '../Card/Card';
import { IoSettings } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { curr_config } from '../../contexts/Conf';

const Navbar = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const now_config = useContext(curr_config) ; 
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-[6vh] p-2 items-center justify-between">
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex flex-shrink-0 items-center">
                <img className=" h-[5vh] w-auto rounded-lg" src="./logo.png" alt="Your Company" />
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <Link to={`/${now_config.logged_in_userid}`} className="bg-gray-900 h-[4.5vh] my-1 flex items-center text-white rounded-md px-3 py-2 text-sm font-medium px-0" aria-current="page">Dashboard</Link>
                  <Link to = "/code" className="text-gray-300 h-[4.5vh] my-1 flex items-center hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">code</Link>
                  <Link to = "/con/con" className="text-gray-300 h-[4.5vh] my-1 flex items-center hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">connect</Link>
                  <div className="relative" onMouseLeave={closeDropdown}>
                    <button onClick={toggleDropdown} className="text-gray-300 h-[4.5vh] my-1 flex items-center hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                      Queries
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 12a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zM10 6a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-25 mt-0 w-48 bg-gray-800 rounded-b-lg shadow-lg" style={{ zIndex: '10' }}>
                        <Link to="/post-query" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Post Query</Link>
                        <Link to="/solve-query" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Solve Query</Link>
                      </div>
                    )}
                  </div>
                  <Link to="/blog" className="text-gray-300 h-[4.5vh] my-1 flex items-center hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">blog</Link>
                </div>
              </div>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              <Link to="/settings">
                <IoSettings style={{ fontSize: "1.2em" }} className='m-[auto] h-[4.5vh] w-[2em] hover:bg-gray-700 rounded-md' />
              </Link>
              <button type="button" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>

              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
