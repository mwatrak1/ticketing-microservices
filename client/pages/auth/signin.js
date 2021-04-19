import { useState } from 'react'
import Router from 'next/router'
import useRequestHook from '../../hooks/use-request'

const signInForm =  () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const { performRequest, errors} = useRequestHook({
        url: '/api/users/signin',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    }
    )

    const onSubmit = async (event) => {
        event.preventDefault()

        performRequest()
    }

    return (
        <form onSubmit={onSubmit}>
            <h1>Sign in</h1>
            <div className="form-group">
                <label>Email address</label>
                <input 
                    className="form-control" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input 
                    className="form-control" 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                />
            </div>
        
            {errors}
            
            <button className="btn btn-primary">Sign in</button>
        </form>
    )
}

export default signInForm