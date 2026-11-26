# Project Reflection

I chose the Library Borrowing System because libraries are useful for students and the system is easy to understand. Students need to search for books and manage their borrowing activities. I thought this would be a good domain to practise changing an existing application into a different business system.

During this project, I adapted the CloudEats tutorial into a Library Borrowing System. I changed the original food-related services into User Service, Book Service and Order Service. I also changed the API routes and endpoints to use library-related names, such as `/api/books` and `/api/orders`.

The data models were also redesigned to match the new domain. For example, the original food and menu information was replaced with book information. User data is used to manage library users, while borrowing information is used to record borrowing orders. MySQL stores user and book information, MongoDB stores borrowing orders, and Redis is used for temporary cart data. These changes were necessary because a library system needs to manage books and borrowing activities instead of food products and food orders.

I also learned how to use Docker and Docker Compose to run multiple services together. I configured environment variables, health checks, networks and persistent volumes. I added JWT authentication to verify users and RBAC to protect the admin user listing endpoint. I also used Winston for application logging and Prometheus to monitor the three microservices. GitHub Actions was configured to run unit tests and automate deployment to my Ubuntu virtual machine.

One of the biggest challenges was configuring the containers and making sure the services could communicate correctly. Sometimes, containers did not start successfully on the first attempt. I had to check the logs, find the problems and test the configuration again. Setting up the deployment workflow also required several attempts before it worked successfully.

Overall, this project improved my understanding of microservices, database management, Docker, security, monitoring and CI/CD. I also learned that changing an application's business domain requires more than changing its name. The services, data models and API routes must all match the new business requirements.