import { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'

const showOrder = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0)
    const { performRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: () => Router.push('/orders/myOrders')
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)

        return () => {
            clearInterval(timeLeft)
        }
    }, [])

    if (timeLeft < 0) {
        return (
            <div>
                <h1>Order expired</h1>
                <Link href="/tickets/[ticketId]" as={`/tickets/${order.ticket.id}`}>
                    <a>Back to ticket</a>
                </Link>
            </div>
            )
    }

    return (
    <div>
        <h1>Order for {order.ticket.title}</h1>
        <h4>
            Time until order expires: {timeLeft} seconds
        </h4>
        <StripeCheckout
            token={(token) => performRequest({token: token.id})}
            stripeKey="pk_test_51I73SbAeAM5dS1gOoRiYAoKFswpdRm8qLcI1lVI0q2MCU7qIq9fIhqh8cC74DuEPFpsZKJz9L55fJwpuRDSdJE7L00g4ty0QO7"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>
    )
}

showOrder.getInitialProps = async (context, client) => {
    const { orderId } = context.query
    const { data } = await client.get(`/api/orders/${orderId}`)
    return { order: data }
}

export default showOrder