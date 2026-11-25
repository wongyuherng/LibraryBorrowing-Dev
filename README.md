## Labs Completed
- [x] Lab 1.1: Development Environment Setup
- [x] Lab 2.1: Static Library Website + First Docker Container
- [ ] Lab 2.2: Multi-Container Applications

## How to Run — Library Borrowing Website

### With Docker (Recommended)

```bash
cd ~/libraryborrowing-app/frontend
sudo docker build -t libraryborrowing-menu:v1.0 .
sudo docker run -d -p 3000:80 --name menu libraryborrowing-menu:v1.0
# Access: http://[VM-IP]:3000/index.html
```

### Stop the Container

```bash
sudo docker stop menu
sudo docker rm menu
```