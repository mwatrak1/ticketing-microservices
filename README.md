# Ticketing - microservices app

   Ticketing is an app made with microservice architectural pattern for buying and selling tickets for any events. Each service is a Docker container with it's own    DB plus there is an event-bus made with NATS - which enables cross service communications.  
   
   It's a scallable solution for an e-commerce app which could need more resources at certain times - maybe a popular musician starts selling his new tour - so      the website would have to handle a sudden spike in visitors and would have to deal with thousands of tickets being ordered at the same time - microservices      pattern solves this problem - app can be set up so it automatically provisions more replicas of a busy service so it can handle additional traffic.
   
   
---

## It consists of those components:
### auth service

   Takes care of user authentication: registration, login and logout - it authorizes users by giving them a Json Web Token as a Cookie which is neccesary for making requests to certain routes like orders
  
   
### tickets service

   Stores all the available tickets and handles ticket creation and deletion
   
   Publishes events:  
   - TicketCreated - informs order service about ticket being created
   - Ticket Updates - informs order service about ticker being updated

### orders service
   Has information about orders and tickets associated with each order - it creates and cancelles orders - if they haven't been paid for
   
   Publishes events:  
   - OrderCreated - informs ticket service that ticket is reserved and enables other users from trying to buy this particular ticket and informs expiration service
   that it should set the payment timer for the order
   - OrderCancelled - informs the ticket service that order has been cancelled so that the ticket can be available for sale again
   
### payments service
   It awaits for a payment for a particular order and stores payment information
   
   Publishes events:  
   - PaymentCreated - informs order service that the order has been paid for so it can mark is as finished
   
### expiration service
   It expires an order if the user haven't paid for it within 15 minutes. It creates a timer and after it passes publishes an event.
   
   Publishes events:  
   - ExpirationComplete - informs orders service that time for payment has been finished so it can either ignore it it payment already happened or 
   if it didn't then order service marks it al cancelled and ticket is  available again

### client frontend
   It's a graphical interface made in React and Next.js 
   
### common module
   It's a npm package containing components common to many services like middlewares, interfaces and error handlers
   
### infra directory
   It contains the definition of all services needed to run in a Kubernetes cluster
   
