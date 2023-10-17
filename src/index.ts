import express, {Request, Response} from 'express'
import cors from 'cors'
import {db} from './database/knex'
import {  TUserDB, TTaskDB } from './types'

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

// Endpoint GET todos os usuarios
app.get('/users', async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.query.q as string | undefined

        if (q === undefined) {
            const result = await db('users')
            res.status(200).send(result)

        } else {
            const result = await db('users').where('name', 'LIKE', `%${q}%`)
            res.status(200).send(result)
        }



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

// Endpoint POST para criar um novo usuario
app.post('/users', async (req:Request, res: Response): Promise<void> => {
    try {
        const {id, name, email, password} = req.body
        const [idExists]: Array<TUserDB> | Array<undefined> = await db('users').where('id', id)
        const [emailExists]: Array<TUserDB> | Array<undefined> = await db('users').where('email', email)
    
        if (typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            res.status(400)
            throw new Error('Tipos dos dados incorretos, todos os dados devem ser do tipo "string".')
        }
        if (!id || !name || !email || !password) {
            res.status(400)
            throw new Error('Dados faltando, cheque se todos os parametros estao sendo passados')
        }
        if (idExists || emailExists) {
            res.status(400)
            throw new Error('Id ou Email ja existentes, favor tentar novamente com dados diferentes.')
        }
        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }

        await db('users').insert(newUser)

        res.status(200).send('Usuario criado com sucesso!')
        
        
    } catch (error) {
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

// Endpoint DELETE para deletar usuarios a partir do ID
app.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id
        const [userToBeDeleted]: Array<TUserDB> | Array<undefined> = await db('users').where('id', id)
        console.log(userToBeDeleted)
        
        if(!userToBeDeleted) {
            res.status(404)
            throw new Error('Usuario nao encontrado, favor checar o "id"')
        }

        await db('users').del().where('id', id)

        res.status(200).send('Usuario deletado com sucesso')

        
    } catch (error) {
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

// Endpoint GET para todos os usuarios ou usando um query param
app.get('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        const q = req.query.q
        if(q) {
            const result = await db('tasks').where('title', 'LIKE', `%${q}%`)
            res.status(200).send(result)
        } else {
            const allResults = await db('tasks')
            res.status(200).send(allResults)
            
        }


    } catch (error) {
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

// Endpoint POST para criacao de novas tasks
app.post('/tasks', async (req: Request, res: Response): Promise<void> => {
    try {
        const {id, title, description } = req.body
        const [idExists]: Array<TTaskDB> | undefined = await db('tasks').where('id', id)

        if(idExists) {
            res.status(400)
            throw new Error('"id" ja cadastrado')
        }
        if(typeof id !== 'string' || typeof title !== 'string' || typeof description !== 'string') {
            res.status(400)
            throw new Error('Tipos de dados errados, os dados devem ser do tipo "string".')
        }

        const newTask: TTaskDB = {
            id,
            title,
            description
        }

        await db('tasks').insert(newTask)

        res.status(200).send('Task criada com sucesso!')

    } catch (error) {
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

// Endpoint PUT para edicao das tasks existentes
app.put('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id
        const newId: string = req.body.id
        const newTitle: string = req.body.title
        const newDescription: string = req.body.description
        const [taskToBeUpdated] = await db('tasks').where('id', id)

        if(!taskToBeUpdated) {
            res.status(404)
            throw new Error('Task nao encontrada, cheque o id')
        }

        const editedTask: TTaskDB = {
            id: newId || taskToBeUpdated.id,
            title: newTitle || taskToBeUpdated.title,
            description: newDescription || taskToBeUpdated.description
        }

        await db('tasks').update(editedTask).where('id', id)

        res.status(200).send('Task updated com sucesso!')



    } catch (error) {
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

// Endpoint DELETE para deletar tasks a partir do id
app.delete('/tasks/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id
        const [taskToBeDeleted]: Array<TTaskDB> | undefined = await db('tasks').where('id', id)

        if(!taskToBeDeleted) {
            res.status(404)
            throw new Error('Task nao encontrada, favor checar o "id".')
        }

        await db('tasks').del().where('id', id)
        res.status(200).send('Task deletada com sucesso!')

    } catch (error) {
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