import React, { useRef } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import uuid from 'react-uuid'
import { Button } from 'react-bootstrap'


const ProductInput = ({ product, setTransactionControl }) => {
    const nameRef = useRef()
    const modelRef = useRef()
    const unitRef = useRef()
    const priceRef = useRef()
    const inStockRef = useRef()

    const onUpdate = async () => {
        const db = firebase.firestore()
        const name = nameRef.current.value
        const model = modelRef.current.value
        const unit = unitRef.current.value
        const price = priceRef.current.value
        const instock = inStockRef.current.value
        await db.collection('Products').doc(product.id).set({ ...product, name, model, unit, price, instock })
        newTransaction(instock, price, product.id)
        window.location.reload()
    }

    const onDelete = async () => {
        const db = firebase.firestore()
        await db.collection('Products').doc(product.id).delete()
        window.location.reload()
    }

    const newTransaction = async(instock, price, productID) => {
        const transactionQuantity = instock - product.instock
        if(transactionQuantity === 0) return
        const transactionMoneyFlow = transactionQuantity * price * (-1)
        const timestamp = firebase.firestore.Timestamp.fromDate(new Date())
        const db = firebase.firestore()
        await db.collection('Transactions').add({ transactionQuantity, transactionMoneyFlow, timestamp, productID })
    }

    return (
        <tr key={uuid()}>
            <td>{product.id}</td>
            <td>
                <input
                    defaultValue={product.name}
                    ref={nameRef} />
            </td>
            <td>
                <input
                    defaultValue={product.model}
                    ref={modelRef} />
            </td>
            <td>
                <input
                    defaultValue={product.unit}
                    ref={unitRef} />
            </td>
            <td>
                <input
                    type="number"
                    defaultValue={product.price}
                    ref={priceRef} />
            </td>
            <td>
                <input
                    type="number"
                    defaultValue={product.instock}
                    ref={inStockRef} />
            </td>
            <td>
                <Button variant="warning" onClick={onUpdate}>Update</Button>
            </td>
            <td align="center">
                <Button variant="secondary" onClick={() => setTransactionControl(true, product.id, product.name)}>View</Button>
            </td>
            <td>
                <Button variant="danger" onClick={onDelete}>Delete</Button>
            </td>
        </tr>
    )
}

export default ProductInput
