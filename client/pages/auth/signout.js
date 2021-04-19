import Router from 'next/router'
import { useEffect } from 'react'
import useRequestHook from '../../hooks/use-request'

const signOut = () => {
    const { performRequest } = useRequestHook({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    })

    useEffect(() => {
        performRequest()
    }, [])

    return <div>
        <h1>Signing you out...</h1>
    </div>
}

export default signOut