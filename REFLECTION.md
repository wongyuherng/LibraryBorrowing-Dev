# Project Reflection

During this project, I learned how to develop and manage a Library Borrowing System using a microservices architecture. The project was adapted from the CloudEats tutorial. Instead of developing a food ordering system, I changed the system into a library application that focuses on users, books and borrowing orders.

One of the main things I learned was how to separate an application into different services. My project contains four main services: User Service, Book Service, Order Service and API Gateway. Each service has its own responsibility. For example, User Service manages user information, while Book Service manages book information. Order Service handles borrowing-related operations. The API Gateway connects these services and forwards requests to the correct service.

I also gained experience using Docker and Docker Compose. Through this project, I learned how to configure services in a Docker Compose file and start them together. I also learned about environment variables, health checks, networks and persistent volumes. These features help make the application easier to configure and run.

Another important learning experience was using different databases. MySQL is used for user and book information, MongoDB is used for borrowing orders, and Redis is used for temporary cart data. This helped me understand that different databases can be used for different purposes in the same application.

For testing, I used Jest to perform unit tests on the services. I also configured GitHub Actions to run the tests automatically. This helped me understand the basic idea of Continuous Integration and why testing is important when developing an application.

However, I also faced challenges during development, especially when configuring Docker services and making sure the services could communicate correctly. Sometimes, containers did not start successfully on the first attempt. I had to check the logs, identify the problems and test the configuration again.

Overall, this project improved my understanding of microservices, Docker, databases, API Gateway and automated testing. I also became more confident in adapting an existing tutorial into a different application. There are still areas that I can improve, but this project gave me useful practical experience in cloud application development.