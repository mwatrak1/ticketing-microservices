import 'bootstrap/dist/css/bootstrap.css'
import requestClient from '../api/build-client'
import Header from '../components/header'

const globalRules = ({ Component, pageProps, currentUser }) => {
    return (
    <div>
        <Header currentUser={currentUser}/>
        <div className="container">
            <Component currentUser={currentUser} {...pageProps}  />
        </div>
    </div>
    )
}

globalRules.getInitialProps = async (appContext) => {
    const client = requestClient(appContext.ctx)
    const { data } = await client.get('/api/users/currentuser')

    let pageProps = {};
    if (appContext.Component.getInitialProps){
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    }
    return {
        pageProps,
        ...data
    }
}

export default globalRules