import Link from 'next/link'

const indexPage = ({ currentUser, tickets }) => {

    const onMouseOver = (event) => {
        event.target.style.background = "#F3F8FF"
    }

    const onMouseOut = (event) => {
        event.target.style.background = "#FFFFFF"
    }

    const ticketList = tickets.map(ticket => {
        return (
            <tr 
            key={ticket.id} 
            onMouseEnter={onMouseOver}
            onMouseOut={onMouseOut}
            >
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                        <a>{ticket.title}</a>
                    </Link>
                </td>
                <td>{ticket.price}</td>
                
            </tr>
        )
    })

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table" >
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>

                <tbody>
                    { ticketList }
                </tbody>

            </table>
        </div>
    )
}

indexPage.getInitialProps = async (context, client, userData) => {
    const { data } = await client.get('/api/tickets')
    return { tickets: data }
}

export default indexPage