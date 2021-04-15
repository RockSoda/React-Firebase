import React, { useState, useEffect, useRef } from "react"
import { Card, Button, Alert, Table } from "react-bootstrap"
import { useAuth } from "../contexts/AuthContext"
import { Link, useHistory } from "react-router-dom"
import uuid from 'react-uuid'
import firebase from 'firebase/app'
import 'firebase/firestore'

import ProductInput from './ProductInput'
import Transaction from './Transaction'

export default function Dashboard() {
  const [error, setError] = useState("")
  const [products, setProducts] = useState([])
  const [isViewTransaction, setIsViewTransaction] = useState(false)
  const [transactionProductId, setTransactionProductId] = useState('')
  const [transactionProductName, setTransactionProductName] = useState('')

  const newNameRef = useRef()
  const newModelRef = useRef()
  const newUnitRef = useRef()
  const newPriceRef = useRef()
  const newInStockRef = useRef()

  const [query, setQuery] = useState('')
  const { currentUser, logout } = useAuth()
  const history = useHistory()

  const fetchData = async () => {
    const db = firebase.firestore()
    const data = await db.collection("Products").get()

    setProducts(data.docs.map(product => ({ ...product.data(), id: product.id })))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const onCreate = async () => {
    const db = firebase.firestore()
    await db.collection('Products').add({
      instock: newInStockRef.current.value,
      model: newModelRef.current.value,
      name: newNameRef.current.value,
      price: newPriceRef.current.value,
      unit: newUnitRef.current.value
    })

    window.location.reload()
  }

  const setTransactionControl = (isShowTransaction, productID, productName) => {
    setIsViewTransaction(isShowTransaction)
    setTransactionProductId(productID)
    setTransactionProductName(productName)
  }

  const onSearch = async () => {
    const db = firebase.firestore()
    if (query === '') {
      fetchData()
      return
    }
    const product = await db.collection('Products').doc(query).get()
    if(product.data()) setProducts([{ ...product.data(), id: product.id }])
      
  }

  async function handleLogout() {
    setError("")

    try {
      await logout()
      history.push("/login")
    } catch {
      setError("Failed to log out")
    }
  }

  const table_heads = (isViewTransaction) ? ['Product ID', 'Name', 'Period', 'Income/Outcome($)', 'Import/Sale(Quantity)'] : ['ID', 'Name', 'Model', 'Unit', 'Price($)', 'In Stock', 'Update', 'Transaction', 'Delete']
  return (
    <>
      {isViewTransaction ? (
        <div className="w-100 text-center mt-2">
          <Button variant="link" onClick={() => setIsViewTransaction(false)}>
            Back
        </Button>
        </div>
      ) : (
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Search product by ID"
            onChange={e => {
              setQuery(e.target.value)
            }} />
          <div class="input-group-append">
            <Button variant="info" onClick={onSearch}>Search</Button>
          </div>
        </div>
      )}
      <Table size="sm" style={isViewTransaction ? { 'marginLeft': '-230px' } : { 'marginLeft': '-510px' }}>
        <thead class="thead-light">
          <tr>
            {table_heads.map(heading => (
              <th key={uuid()} scope="col">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isViewTransaction ? (
            <Transaction productId={transactionProductId} productName={transactionProductName} />
          ) : (
            products.map(product => (
              <ProductInput key={uuid()} product={product} setTransactionControl={setTransactionControl} />
            ))
          )}

          {!isViewTransaction && <tr key={uuid()}>
            <td></td>
            <td>
              <input class="form-control"
                ref={newNameRef} />
            </td>
            <td>
              <input class="form-control"
                ref={newModelRef} />
            </td>
            <td>
              <input class="form-control"
                ref={newUnitRef} />
            </td>
            <td>
              <input class="form-control"
                type="number"
                ref={newPriceRef} />
            </td>
            <td>
              <input class="form-control"
                type="number"
                ref={newInStockRef} />
            </td>
            <td>
              <Button onClick={onCreate}>Add</Button>
            </td>
            <td></td>
            <td></td>
          </tr>}
        </tbody>
      </Table>
      <div className="w-100 text-center mt-2">
        <Button variant="link" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </>
  )
}
