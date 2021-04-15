import React, { useState, useEffect } from 'react'
import uuid from 'react-uuid'

import firebase from 'firebase/app'
import 'firebase/firestore'

const Transaction = ({ productId, productName }) => {
    const [transactions, setTransactions] = useState([])
    const [weekly, setWeekly] = useState([])

    useEffect(() => {
        const fetch = async () => {
            const db = firebase.firestore()

            const res = await db
                .collection('Transactions')
                .where('productID', '==', productId)
                .orderBy('timestamp', 'desc')
                .get()

            setTransactions(res.docs.map(transaction => (transaction.data())))
        }
        fetch()

    }, [])
    const timeToRender = (time) => {
        const time_arr = time.split(' ')
        return `${time_arr[0]} ${time_arr[1]} ${time_arr[2]}, ${time_arr[3]}`
    }

    useEffect(() => {
        if (transactions.length === 0) return

        let weeklyMoneyFlow = 0
        let weeklyQuantity = 0
        let startWeek = transactions[transactions.length - 1].timestamp.toDate().getTime()
        let endWeek = startWeek + 7 * 86400000

        for (let i = transactions.length - 1; i >= 0; i--) {
            const transaction = transactions[i]
            const currentTransactionTime = transaction.timestamp.toDate().getTime()
            if (currentTransactionTime <= endWeek) {
                weeklyMoneyFlow += transaction.transactionMoneyFlow
                weeklyQuantity += transaction.transactionQuantity
            } else {
                const moneyFlow = weeklyMoneyFlow
                const quantity = weeklyQuantity
                const from = timeToRender(new Date(startWeek).toString())
                const to = timeToRender(new Date(endWeek).toString())
                setWeekly(prev => [...prev, { productId, productName, period: `${from} - ${to}`, weeklyMoneyFlow: moneyFlow, weeklyQuantity: quantity }])
                weeklyMoneyFlow = 0
                weeklyQuantity = 0
                startWeek = currentTransactionTime
                endWeek = startWeek + 7 * 86400000
                i++
            }
        }

        if (weeklyMoneyFlow !== 0 || weeklyQuantity !== 0) {
            const moneyFlow = weeklyMoneyFlow
            const quantity = weeklyQuantity
            const from = timeToRender(new Date(startWeek).toString())
            const to = timeToRender(new Date(endWeek).toString())
            setWeekly(prev => [...prev, { productId, productName, period: `${from} - ${to}`, weeklyMoneyFlow: moneyFlow, weeklyQuantity: quantity }])
        }
    }, [transactions])

    return (
        <>
            {(weekly.length !== 0) && weekly.map(transaction => (
                <tr key={uuid()}>
                    <td>{transaction.productId}</td>
                    <td>{transaction.productName}</td>
                    <td style={{ 'whiteSpace': 'nowrap', 'overflow': 'hidden' }}>{transaction.period}</td>
                    <td>{transaction.weeklyMoneyFlow}</td>
                    <td>{transaction.weeklyQuantity}</td>
                </tr>
            ))}
        </>
    )
}

export default Transaction
