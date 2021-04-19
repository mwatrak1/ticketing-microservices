import express, { Request, Response} from 'express'
import { Ticket } from '../models/ticket'
import { NotFoundError } from '@ticketing.org/common'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const userId = req.params.id
    const ticket = await Ticket.findById(userId)

    if (!ticket){
        throw new NotFoundError()
    }

    res.send(ticket)
})

export { router as getTicketByIdRouter }