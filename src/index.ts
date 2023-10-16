import express, {Request, Response} from 'express'
import cors from 'cors'
import {db} from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

// testando setup
app.get('/ping', async (req: Request, res: Response): Promise<void> => {
    try {
        
        res.status(200).send('pong!')
    } catch (error) {
        console.log(error)
        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})