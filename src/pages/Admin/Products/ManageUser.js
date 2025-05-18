import React, { useEffect, useState } from 'react'
import SideBar from '../../../components/SideBar/SideBar'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './ManageUser.css'

function ManageUser() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await axios.get('https://gr-backend.onrender.com/api/users')
            setUsers(res.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

  return (
    <div className="admin-container">
      <div className="sidebar-wrapper">
        <SideBar />
      </div>
      <div className="main-wrapper">
        <table className="user-table">
            <thead>
                <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>Ngày sinh</th>
                    <th>Giới tính</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.address}</td>
                        <td>{user.birth_date}</td>
                        <td>{user.gender}</td>  
                        <td>
                            <button className="action-btn">
                                <Link to={`/update/${user.id}`}>UPDATE</Link>
                            </button>
                            <button className="action-btn">
                                <Link to={`/delete/${user.id}`}>DELETE</Link>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageUser