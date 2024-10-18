import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as xlsx from 'xlsx';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdModeEdit } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdArrowBackIosNew } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import 'react-international-phone/style.css';



const Data = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checked, setChecked] = useState([]);
    const [checkAll, setCheckAll] = useState(false);
    const [editingRow, setEditingRow] = useState(null); // Track the row being edited
    const [filteredItems, setFilteredItems] = useState([]);
    const [groupFilter, setGroupFilter] = useState({
        search: '',
        filter: ''
    });
    const [itemsPerPage] = useState(5);
    const [page, setPage] = useState(1);
    const [numberOfIndex, setNumberOfIndex] = useState(0);

    useEffect(() => {
        setNumberOfIndex(Math.ceil(data.length / itemsPerPage));
    }, [data, itemsPerPage]);

    console.log(data);

    useEffect(() => {
        axios.get('/api/excelFile')
            .then((response) => {
                setData(response.data);
                setFilteredItems(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setLoading(false);
            });
    }, []);


    useEffect(() => {
        let value = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
        let filteredItemsd = [...value];

        if (groupFilter.filter) {
            filteredItemsd = value.filter((el) => el.group === groupFilter.filter);
        }
        if (groupFilter.search) {
            filteredItemsd = filteredItemsd.filter((el) =>
                el.name.toLowerCase().includes(groupFilter.search.toLowerCase())
            );
        }
        setFilteredItems(filteredItemsd);
    }, [groupFilter, page, data, itemsPerPage]);




    const navigate = useNavigate();

    useEffect(() => {
        setCheckAll(false);
    }, [data]);

    useEffect(() => {
        if (checked.length > 0) {
            setCheckAll(true);
        }
    }, [checked]);

    const handleCheckboxChange = (index) => {
        setChecked((prevChecked) => {
            let newChecked;
            if (prevChecked.includes(index)) {
                newChecked = prevChecked.filter((i) => i !== index);
            } else {
                newChecked = [...prevChecked, index];
            }

            setCheckAll(newChecked.length === data.length);

            return newChecked;
        });
    };

    const handleCheckAll = () => {
        if (checkAll) {
            setChecked([]);
        } else {
            const allIndexes = data.map((_, i) => i);
            setChecked(allIndexes);
        }
        setCheckAll(!checkAll);
    };

    const fileName = 'data';

    const handleCsvDownload = () => {
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `${fileName}.xlsx`);
    };

    const handleEditData = (index, name, value) => {
        const updatedData = [...data];
        updatedData[index][name] = value;
        setData(updatedData);
        setFilteredItems(updatedData);
    };


    //DELETE MODAL GOES HERE

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentRowToDelete, setCurrentRowToDelete] = useState(null);

    const handleDeleteClick = (index) => {
        setShowDeleteModal(true);
        setCurrentRowToDelete(index);
    };

    const deleteRow = () => {
        deletePreview(currentRowToDelete);
        console.log(currentRowToDelete);
        setShowDeleteModal(false);
    };

    const deletePreview = (index) => {
        if (!data || !Array.isArray(data)) return;
        const updatedData = data.filter((_, i) => i !== index);
        console.log(updatedData, "updated data");
        setData(updatedData);
        setFilteredItems(updatedData);
        axios.post('/api/editDataInCsv', updatedData)
            .then((response) => {
                console.log(response);
            });
        toast.success('🦄 Data Updated Successfully!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };


    const DeleteModal = () => (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this row?</h2>
                <div className="flex justify-end">
                    <button
                        className="bg-red-600 text-white py-2 px-4 rounded-md mr-2"
                        onClick={deleteRow}
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


    const deleteMultiples = (e) => {
        e.preventDefault();
        const updatedData = data.filter((_, i) => !checked.includes(i));
        setData(updatedData);
        setChecked([]);
        axios.post('/api/editDataInCsv', updatedData)
            .then((response) => {
                console.log(response);
            });
    };


    //DELETE MODAL ENDS HERE


    const handlePdfDownload = async () => {
        try {
            const response = await axios.get("/api/downloadPdf", {
                responseType: "blob",
            });

            const pdfBlob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(pdfBlob);
            const tempLink = document.createElement("a");
            tempLink.href = url;
            tempLink.setAttribute("download", "data.pdf");
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        }
    };

    const startEditing = (index) => {
        setEditingRow(index); // Set the row to edit mode
    };

    const stopEditing = () => {
        setEditingRow(null); // Exit edit mode
        axios.post('/api/editDataInCsv', data)
            .then((response) => {
                console.log(response);
            });
        toast.success('🦄 Data Updated Successfully!', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };

    const renderPaginationButtons = () => {
        const arr = [];
        for (let i = 1; i <= numberOfIndex; i++) {
            arr.push(i);
        }

        return arr.map((val) => (
            <button
                key={val}
                className={`mx-1 px-3 py-2 rounded-lg font-medium transition duration-300 ${page === val ? 'bg-white text-blue-600' : 'bg-blue-100 text-gray-600 hover:bg-white'
                    }`}
                onClick={(e) => {
                    e.preventDefault();
                    setPage(val);
                }}
            >
                {val}
            </button>
        ));
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 relative">

            <button
                onClick={() => { navigate('/'); }}
                className="absolute left-10 top-10 bg-blue-500 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
            >
                <MdArrowBackIosNew className="w-5 h-5" /> <span>Go Back</span>
            </button>


            <div className="w-full max-w-5xl mb-8 p-6 bg-white shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-blue-600">Export Data</h1>
                </div>
                <div className="flex justify-between items-center space-x-6">
                    <div className="w-full flex flex-col items-center bg-gray-100 p-4 rounded-lg">
                        <h1 className="text-lg font-medium text-gray-700 mb-4">Click here to export data into CSV file:</h1>
                        <button
                            onClick={handleCsvDownload}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                        >
                            Download CSV
                        </button>
                    </div>
                    <div className="w-full flex flex-col items-center bg-gray-100 p-4 rounded-lg">
                        <h1 className="text-lg font-medium text-gray-700 mb-4">Click here to export data into PDF file:</h1>
                        <button
                            onClick={handlePdfDownload}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition duration-300"
                        >
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            <h1 className="text-4xl font-bold text-blue-600 mb-8">Uploaded Data</h1>

            {showDeleteModal && <DeleteModal />}

            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <p className="text-lg font-medium text-gray-500">Loading data, please wait...</p>
                </div>
            ) : data === null || data.length === 0 ? (
                <p className="text-2xl font-medium text-red-500">No Data Found !!!</p>
            ) : (
                <div className="w-full max-w-[90rem] bg-white shadow-lg rounded-lg p-6">
                    <div className="w-full max-w-[90rem] bg-white shadow-lg rounded-lg p-6">
                        <div className="overflow-x-auto">

                            <div className="w-full flex justify-between items-center mb-4">
                                <label className="text-lg font-semibold text-gray-700 mr-4">Sort By:</label>
                                <select
                                    name="filter"
                                    required
                                    value={groupFilter.filter}
                                    onChange={(e) => setGroupFilter({ ...groupFilter, filter: e.target.value })}
                                    className="w-1/3 px-4 mt-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out hover:bg-gray-100"
                                >
                                    <option value="" className='font-bold'>
                                        ALL GROUPS
                                    </option>
                                    <option value="A">Group A</option>
                                    <option value="B">Group B</option>
                                    <option value="C">Group C</option>
                                    <option value="D">Group D</option>
                                </select>
                            </div>

                            <div className="w-full flex justify-between items-center mb-4">
                                <label className="text-lg font-semibold text-gray-700 mr-4">Search By:</label>
                                <div className="w-1/3 relative">
                                    <input
                                        type="text"
                                        value={groupFilter.search}
                                        onChange={(e) => {
                                            const dummy = { search: e.target.value, filter: groupFilter.filter };
                                            setGroupFilter(dummy);
                                        }}
                                        placeholder="Search by name"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out hover:bg-gray-100"
                                    />
                                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                </div>
                            </div>


                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="pl-2 py-3 text-left text-sm font-semibold">
                                            <input
                                                type="checkbox"
                                                checked={checkAll}
                                                onChange={handleCheckAll}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Gender</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Group</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Bio</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Number</th>
                                        <th className="pl-10 py-3 text-sm font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                {checked.length > 1 && (
                                    <div className="flex justify-center items-center p-4">
                                        <button
                                            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition duration-300"
                                            onClick={deleteMultiples}
                                        >
                                            Delete Multiple Items
                                        </button>
                                    </div>
                                )}

                                <tbody>
                                    {filteredItems.map((info, index) => (

                                        <tr key={index} className="border-t border-gray-300 hover:bg-gray-100 transition">
                                            <td className='pl-2'>
                                                <input
                                                    type="checkbox"
                                                    checked={checked.includes(index)}
                                                    onChange={() => handleCheckboxChange(index)}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="text"
                                                        name='name'
                                                        value={info.name || ''}
                                                        onChange={(e) => handleEditData(index, 'name', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span>{info.name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingRow === index ? (
                                                    <input
                                                        type="text"
                                                        name='subject'
                                                        value={info.subject || ''}
                                                        onChange={(e) => handleEditData(index, 'subject', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <span>{info.subject}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">{editingRow === index ? (
                                                <div>
                                                    <label className="flex items-center">
                                                        <input
                                                            type='radio'
                                                            required
                                                            name={`gender_${index}`}
                                                            value='male'
                                                            checked={info.gender === 'male'}
                                                            onChange={(e) => handleEditData(index, 'gender', e.target.value)}
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
                                                            onChange={(e) => handleEditData(index, 'gender', e.target.value)}
                                                            className="mr-2 focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        Female
                                                    </label>
                                                </div>
                                            ) : (
                                                <span>{info.gender}</span>
                                            )}</td>
                                            <td className="px-4 py-2">{editingRow === index ? (
                                                <select
                                                    name="group"
                                                    required
                                                    value={info.group}
                                                    onChange={(e) => handleEditData(index, 'group', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option defaultChecked disabled value="" className='font-bold'>Select Group Type</option>

                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            ) : (
                                                <span>{info.group}</span>
                                            )}</td>
                                            <td className="px-4 py-2">{editingRow === index ? (
                                                <input
                                                    type="text"
                                                    name='bio'
                                                    value={info.bio || ''}
                                                    onChange={(e) => handleEditData(index, 'bio', e.target.value)}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <span>{info.bio}</span>
                                            )}</td>
                                            <td className="px-4 py-2">{editingRow === index ? (
                                                <input
                                                    defaultCountry="RU"
                                                    name='number'
                                                    value={info.number || ''}
                                                    onChange={(e) => handleEditData(index, 'number', e.target.value)}
                                                />
                                            ) : (
                                                <span>{info.number}</span>
                                            )}</td>
                                            <td className="pl-10 py-2 flex justify-center space-x-2">
                                                {editingRow === index ? (
                                                    <button
                                                        className="text-green-500 hover:text-green-700 transition"
                                                        onClick={stopEditing}
                                                    >
                                                        Save
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="text-blue-500 hover:text-blue-700 transition"
                                                        onClick={() => startEditing(index)}
                                                    >
                                                        <MdModeEdit className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    onClick={() => handleDeleteClick(index)} // Trigger delete modal
                                                >
                                                    <RiDeleteBin6Line className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>


                                    ))}
                                    <div className="bg-blue-500 flex justify-between items-center p-4 rounded-lg">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page <= 1}
                                            className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
                                        >
                                            Prev
                                        </button>
                                        <div className="flex justify-center my-4">
                                            {renderPaginationButtons()}
                                        </div>
                                        <button
                                            onClick={() => { filteredItems.length >= itemsPerPage && setPage(page + 1) }}
                                            className="bg-white text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
                                        >
                                            Next
                                        </button>
                                    </div>

                                </tbody>

                            </table>
                        </div>
                    </div>



                </div>
            )}

        </div>
    );
};

export default Data;
