import Link from 'next/link'

const myOrders = ({ orders }) => {
    const ordersDiv = orders.map(order => {
        return (
            <tr key={order.id}>
                <td>
                    <Link href="/orders/[orderId]" as={`/orders/${order.id}`} >
                        <a>{order.ticket.title}</a>
                    </Link>
                </td>
                <td>{order.status}</td>
                <td>{new Date(order.expiresAt).toUTCString()}</td>
            </tr>
        )
    })
    console.log(orders)

    return (
        <div>
            <h1>My orders</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Ticket name</th>
                        <th>Order status</th>
                        <td>Order date</td>
                    </tr>
                </thead>

                <tbody>
                    { ordersDiv }
                </tbody>
            </table>
        </div>
    )
}

myOrders.getInitialProps = async ( context, client ) => {
 const { data } = await client.get('/api/orders')
 return { orders: data}
}

export default myOrders