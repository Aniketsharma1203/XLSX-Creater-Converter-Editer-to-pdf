import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { MdStar } from "react-icons/md";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Home = () => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        gender: '',
        group: '',
        bio: '',
        number: ''
    });

    const [data, setData] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {

    }, [data])

    const handleFileUpload = (e) => {
        if (e.target.files.length === 0) {
            alert("Please Choose Some File.")
        }
        else {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const workbook = XLSX.read(event.target.result, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(sheet);

                setData(sheetData);
            };

            reader.readAsBinaryString(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('/api/data', formData)
            .then((response) => {
                console.log(response);

                toast.success('🦄 Data Submitted Successfully!', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });

                setFormData({
                    name: '',
                    subject: '',
                    gender: '',
                    group: '',
                    bio: '',
                    number: ''
                });
            })
            .catch((error) => {
                console.error(error);
                toast.error('Something went wrong!');
            });
    };


    const addDataToCsv = (e) => {
        e.preventDefault();
        let isEmpty = false;
        let isBroken = false;

        data.map((info, id) => {

            if (isBroken === false) {
                if (info.name === '' || info.subject === '' || info.gender === '' || info.group === '' || info.bio === '' || info.number === '') {
                    isEmpty = true;
                    toast.error('Fill all the data layers.', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    isBroken = true;
                }
            }
            return 1;
        })

        if (isEmpty === false) {
            axios.post('/api/addDataToCsv', data)
                .then((response) => {
                    console.log(response, "data updated succesfully to csv.");
                });
            toast.success('Data Updated Succesfully..', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
    };

    //Delete Functionality Goes Here 

    const [rowToDelete, setRowToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (__rowNum__) => {
        setRowToDelete(__rowNum__);
        setShowDeleteModal(true);
    };

    const DeleteModal = () => {
        return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this row?</h2>
                    <div className="flex justify-end">
                        <button
                            className="bg-red-600 text-white py-2 px-4 rounded-md mr-2"
                            onClick={confirmDeleteRow}
                        >
                            Yes, Delete
                        </button>
                        <button
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const confirmDeleteRow = () => {
        const updatedData = data.filter((info) => info.__rowNum__ !== rowToDelete);
        setData(updatedData);
        setShowDeleteModal(false);
    };

    //Delete Functionality Ends here.

    const navigate = useNavigate();

    const handleImportChange = (index, name, value) => {
        const updatedData = [...data];
        updatedData[index][name] = value;
        setData(updatedData);
    };

    const addnewRow = () => {
        const newRow = {
            name: '',
            subject: '',
            gender: '',
            group: '',
            bio: '',
            number: ''
        };
        setData([newRow, ...data])
    };


    return (

        <div className="flex min-h-screen bg-gray-50">


            <div className="w-64 p-6 bg-blue-600 text-white">
                <ToastContainer />
                <h1 className="text-3xl font-semibold mb-6">Navigation</h1>
                <p className="mb-4">Click here to view all the uploaded data.</p>
                <button
                    onClick={() => navigate('/data')}
                    className="bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition duration-300"
                >
                    View Data
                </button>
            </div>


            <div className="flex flex-col items-center justify-center flex-1 p-6">
                <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mb-8" onSubmit={handleSubmit}>
                    <h1 className="text-3xl font-semibold text-blue-600 mb-6 text-center">Submit Your Details</h1>

                    <div className="mb-5">
                        <label htmlFor="name" className="text-lg text-gray-700 font-medium mb-2 flex">Name <MdStar color='red' size={10} /></label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="subject" className="flex text-lg text-gray-700 font-medium mb-2">Subject <MdStar color='red' size={10} /></label>
                        <input
                            required
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="gender" className="flex text-lg text-gray-700 font-medium mb-2">Gender <MdStar color='red' size={10} /></label>
                        <div className="flex justify-between">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    required
                                    name="gender"
                                    value="male"
                                    onChange={handleChange}
                                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                                />
                                Male
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    onChange={handleChange}
                                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                                />
                                Female
                            </label>
                        </div>
                    </div>

                    <div className="mb-5">
                        <label htmlFor="group" className="flex text-lg text-gray-700 font-medium mb-2">Group <MdStar color='red' size={10} /></label>
                        <select
                            name="group"
                            required
                            value={formData.group}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option defaultChecked disabled value="" className='font-bold'>Select Group Type</option>
                            <option value="A" className='font-bold'>A</option>
                            <option value="B" className='font-bold'>B</option>
                            <option value="C" className='font-bold'>C</option>
                            <option value="D" className='font-bold'>D</option>
                        </select>
                    </div>

                    <div className="mb-5">
                        <label htmlFor="bio" className="flex text-lg text-gray-700 font-medium mb-2">Bio <MdStar color='red' size={10} /></label>
                        <input
                            type="text"
                            name="bio"
                            required
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="number" className="flex text-lg text-gray-700 font-medium mb-2">Phone Number <MdStar color='red' size={10} /></label>
                        <input
                            type="number"
                            name="number"
                            required
                            value={formData.number}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                    >
                        Submit
                    </button>
                </form>

                {showDeleteModal && <DeleteModal />}

                <div className="bg-white p-8 rounded-lg shadow-lg w-full ">
                    <h2 className="text-2xl font-semibold text-blue-600 mb-6 text-center">Import from CSV</h2>
                    <div className="w-full">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        {data && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Imported Data:</h3>

                                <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-300">
                                    <table className="min-w-full bg-white border-collapse">
                                        <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Subject</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Gender</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Group</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Bio</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Number</th>
                                                <th className="px-6 py-4 text-sm font-semibold uppercase text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <button onClick={addnewRow} className='bg-green-400 px-6 py-4 text-left text-sm font-semibold uppercase'>ADD NEW ROW</button>
                                        <tbody className="text-gray-600 text-sm divide-y divide-gray-200">
                                            {data.map((info, index) => (
                                                <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition duration-200`}>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            required
                                                            name='name'
                                                            value={info.name || ''}
                                                            onChange={(e) => handleImportChange(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            required
                                                            name='subject'
                                                            value={info.subject || ''}
                                                            onChange={(e) => handleImportChange(index, 'subject', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex space-x-4 items-center">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type='radio'
                                                                    required
                                                                    name={`gender_${index}`}
                                                                    value='male'
                                                                    checked={info.gender === 'male'}
                                                                    onChange={(e) => handleImportChange(index, 'gender', e.target.value)}
                                                                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                Male
                                                            </label>
                                                            <label className="flex items-center">
                                                                <input
                                                                    type='radio'
                                                                    name={`gender_${index}`}
                                                                    value='female'
                                                                    checked={info.gender === 'female'}
                                                                    onChange={(e) => handleImportChange(index, 'gender', e.target.value)}
                                                                    className="mr-2 focus:ring-2 focus:ring-blue-500"
                                                                />
                                                                Female
                                                            </label>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            name="group"
                                                            required
                                                            value={info.group}
                                                            onChange={(e) => handleImportChange(index, 'group', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            <option defaultChecked disabled value="" className='font-bold'>Select Group Type</option>

                                                            <option value="A">A</option>
                                                            <option value="B">B</option>
                                                            <option value="C">C</option>
                                                            <option value="D">D</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            required
                                                            name='bio'
                                                            value={info.bio || ''}
                                                            onChange={(e) => handleImportChange(index, 'bio', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            required
                                                            name='number'
                                                            value={info.number || ''}
                                                            onChange={(e) => handleImportChange(index, 'number', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleDeleteClick(info.__rowNum__)}
                                                            className="text-red-600 hover:text-red-800 transition-colors duration-300"
                                                        >
                                                            <RiDeleteBin6Line size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                        )}
                        {
                            data && (
                                <div className='flex mt-8  justify-center items-center'>
                                    <button className='bg-green-300 p-2 w-[70%] rounded-xl' onClick={addDataToCsv}>Add Data!!</button>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

